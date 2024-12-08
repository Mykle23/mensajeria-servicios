const amqp = require("amqplib");
const express = require("express");
const config = require("./config");
const RABBITMQ_URL = config.RABBITMQ_URL; // URL de RabbitMQ
const QUEUE_NAME = "telegram.messages"; // Nombre de la cola que se va a consumir

/**
 * Consume mensajes de una cola específica de RabbitMQ.
 * @param {string} queue - Nombre de la cola.
 * @param {function} processMessage - Función para procesar el mensaje.
 */
async function consumeMessages(queue, processMessage) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    console.log(`Esperando mensajes en la cola "${queue}"...`);
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        try {
          console.log(`Mensaje recibido: ${JSON.stringify(message)}`);
          await processMessage(message); // Procesar el mensaje
          channel.ack(msg); // Confirmar el mensaje como procesado
        } catch (error) {
          console.error(`Error procesando mensaje: ${error.message}`);
          channel.nack(msg); // Rechazar el mensaje (puede reencolarlo)
        }
      }
    });
  } catch (error) {
    console.error(`Error al conectar con RabbitMQ: ${error.message}`);
    setTimeout(() => consumeMessages(queue, processMessage), 5000); // Reintento tras 5 segundos
  }
}

/**
 * Lógica específica para procesar mensajes y enviarlos a Telegram.
 * @param {object} message - Mensaje recibido desde RabbitMQ.
 */
async function sendToTelegram(message) {
  try {
    console.log(`Enviando mensaje a Telegram: ${JSON.stringify(message)}`);
    // Aquí podrías integrar la API de Telegram para enviar mensajes
    // Ejemplo de llamada a la API (requiere token y endpoint):
    // const response = await axios.post(`https://api.telegram.org/bot<token>/sendMessage`, {
    //   chat_id: message.to,
    //   text: message.content
    // });
    // console.log(`Respuesta de Telegram: ${response.data}`);
  } catch (error) {
    console.error(`Error enviando mensaje a Telegram: ${error.message}`);
    throw error; // Lanza el error para que el mensaje sea reencolado
  }
}

// Inicia el consumidor de mensajes
consumeMessages(QUEUE_NAME, sendToTelegram);

// Servidor de healthcheck
const healthApp = express();
healthApp.get("/health", (req, res) => res.sendStatus(200));
const PORT = 4000;
healthApp.listen(PORT, () =>
  console.log(`Telegram service healthcheck en puerto ${PORT}`)
);
