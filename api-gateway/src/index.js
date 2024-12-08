const express = require("express");
const amqp = require("amqplib");
const config = require("./config");
const app = express();
app.use(express.json());

const RABBITMQ_URL = config.RABBITMQ_URL;

async function publishToQueue(queue, message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });
  console.log(`Mandando mensaje a ${queue} el mensaje ${message}`);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  await channel.close();
  await connection.close();
}
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
    await publishToQueue(queue, { to, content });
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

publishToQueue("telegram.messages", "Hola mundo");
