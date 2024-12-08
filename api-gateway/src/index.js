const express = require("express");
const config = require("./config");
const { publishToQueue } = require('./rabbitmq');
const app = express();
app.use(express.json());

const RABBITMQ_URL = config.RABBITMQ_URL;

app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

app.post("/send-message", async (req, res) => {
  const { to, content, service } = req.body;

  if (!to || !content || !service) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  const validServices = ["whatsapp", "telegram"];
  if (!validServices.includes(service)) {
    return res.status(400).json({ error: "Servicio no válido" });
  }

  try {
    const queue = `${service}.messages`;
    await publishToQueue(RABBITMQ_URL, queue, { to, content });
    res
      .status(200)
      .json({ message: "Mensaje enviado al sistema de mensajería" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

const PORT = config.PORT;
app.listen(PORT, () =>
  console.log(`API Gateway escuchando en el puerto ${PORT}`)
);

publishToQueue(RABBITMQ_URL, "telegram.messages", "Hola mundo");
