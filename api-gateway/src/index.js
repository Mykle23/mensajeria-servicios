const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const RABBITMQ_URL = "amqp://admin:admin@localhost";
// const RABBITMQ_URL = 'amqp://rabbitmq';

async function publishToQueue(queue, message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });
  console.log(`Mandando mensaje a ${queue} el mensaje ${message}`);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  await channel.close();
  await connection.close();
}

// app.post("/send-message", async (req, res) => {
//   const { to, content, service } = req.body;

//   if (!to || !content || !service) {
//     return res.status(400).json({ error: "Faltan parámetros" });
//   }

//   const validServices = ["whatsapp", "telegram"];
//   if (!validServices.includes(service)) {
//     return res.status(400).json({ error: "Servicio no válido" });
//   }

//   try {
//     const queue = `${service}.messages`;
//     await publishToQueue(queue, { to, content });
//     res
//       .status(200)
//       .json({ message: "Mensaje enviado al sistema de mensajería" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error interno" });
//   }
// });

// const PORT = 3000;
// app.listen(PORT, () =>
//   console.log(`API Gateway escuchando en el puerto ${PORT}`)
// );

publishToQueue("telegram.messages", "Hola mundo");

// // Enviar mensaje cada 10 segundos
// setInterval(() => {
//   publishToQueue("telegram.messages", "Hola mundo");
// }, 10_000); // 10000 ms = 10 segundos

// async function sendBulkMessages(queue, message, numMessages) {
//   const promises = [];

//   // Enviar múltiples mensajes de forma simultánea
//   for (let i = 0; i < numMessages; i++) {
//     promises.push(publishToQueue(queue, `${message} - mensaje ${i + 1}`));
//   }

//   // Esperar a que todas las promesas se resuelvan
//   await Promise.all(promises);
//   console.log(`${numMessages} mensajes enviados a la cola ${queue}`);
// }

// // Ejecutar prueba con 1000 mensajes
// const numMessages = 1000; // Número de mensajes que quieres enviar
// sendBulkMessages("telegram.messages", "Prueba de carga", numMessages).catch(
//   console.error
// );





async function sendBulkMessages(queue, message, numMessages) {
  // Crear un arreglo de promesas para enviar los mensajes en paralelo
  const promises = [];

  // Enviar todos los mensajes de manera concurrente
  for (let i = 0; i < numMessages; i++) {
    promises.push(publishToQueue(queue, `${message} - mensaje ${i + 1}`));
  }

  // Esperar a que todas las promesas se resuelvan (todos los mensajes se envíen)
  await Promise.all(promises);

  console.log(`${numMessages} mensajes enviados a la cola ${queue}`);
}

// Función para ejecutar la función de envío de mensajes de manera aleatoria
function scheduleSendBulkMessages() {
  // Generar un intervalo aleatorio entre 0 y 5000 ms (0-5 segundos)
  const randomDelay = Math.floor(Math.random() * 5000);

  // Esperar el intervalo aleatorio antes de ejecutar la función de envío
  setTimeout(() => {
    // Ejecutar el envío de 100 mensajes
    sendBulkMessages('telegram.messages', "Prueba de carga", 200)
      .then(() => {
        console.log('Envio de mensajes completo');
        // Después de enviar los mensajes, puedes volver a programar otra ejecución aleatoria
        scheduleSendBulkMessages();
      })
      .catch(console.error);
  }, randomDelay);
}

// Iniciar la función programada para ejecutarse aleatoriamente
scheduleSendBulkMessages();