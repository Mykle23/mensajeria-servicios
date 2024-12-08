const express = require("express");
const { consumeFromQueue } = require("./rabbitmq");
const config = require('./config')
const RABBITMQ_URL = config.RABBITMQ_URL; 
const QUEUE_NAME = "telegram.messages"; 

/**
 * Lógica específica para procesar mensajes y enviarlos a Telegram.
 * @param {object} message - Mensaje recibido desde RabbitMQ.
 */
async function sendToTelegram(message) {
  try {
    console.log(`Enviando mensaje a Telegram: ${JSON.stringify(message)}`);
  } catch (error) {
    console.error(`Error enviando mensaje a Telegram: ${error.message}`);
    throw error;
  }
}

// Inicia el consumidor de mensajes
consumeFromQueue(RABBITMQ_URL, QUEUE_NAME, sendToTelegram);

// Servidor de healthcheck
const healthApp = express();
healthApp.get("/health", (req, res) => res.sendStatus(200));
const PORT = 4000;
healthApp.listen(PORT, () =>
  console.log(`Telegram service healthcheck en puerto ${PORT}`)
);
