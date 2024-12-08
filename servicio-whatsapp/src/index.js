const express = require("express");
const { consumeFromQueue } = require("./rabbitmq");
const config = require('./config');
const RABBITMQ_URL = config.RABBITMQ_URL; 
const QUEUE_NAME = "whatsapp.messages"; 

/**
 * Lógica específica para procesar mensajes y enviarlos a WhatsApp.
 * @param {object} message - Mensaje recibido desde RabbitMQ.
 */
async function sendToWhatsapp(message) {
  try {
    console.log(`Enviando mensaje a WhatsApp: ${JSON.stringify(message)}`);
    // Aquí iría la lógica real para enviar el mensaje a través de la API de WhatsApp
  } catch (error) {
    console.error(`Error enviando mensaje a WhatsApp: ${error.message}`);
    throw error;
  }
}

// Inicia el consumidor de mensajes
consumeFromQueue(RABBITMQ_URL, QUEUE_NAME, sendToWhatsapp);

// Servidor de healthcheck
const healthApp = express();
healthApp.get("/health", (req, res) => res.sendStatus(200));
const PORT = 4000;
healthApp.listen(PORT, () =>
  console.log(`WhatsApp service healthcheck en puerto ${PORT}`)
);
