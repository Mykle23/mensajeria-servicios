const amqp = require('amqplib');
const express = require('express');

// Lógica de consumo de mensajes
async function consumeMessages(queue, processMessage) {
  const connection = await amqp.connect('amqp://rabbitmq');
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });

  console.log(`Esperando mensajes en la cola ${queue}`);
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const message = JSON.parse(msg.content.toString());
      try {
        await processMessage(message);
        channel.ack(msg);
      } catch (error) {
        console.error(`Error procesando mensaje: ${error.message}`);
        channel.nack(msg);
      }
    }
  });
}

async function sendToWhatsApp(message) {
  console.log(`Enviando mensaje a WhatsApp: ${JSON.stringify(message)}`);
  // Aquí iría la integración con la API de WhatsApp
}

consumeMessages('whatsapp.messages', sendToWhatsApp);

// Servidor de healthcheck
const healthApp = express();
healthApp.get('/health', (req, res) => res.sendStatus(200));
healthApp.listen(4000, () => console.log('WhatsApp service healthcheck en puerto 4000'));
