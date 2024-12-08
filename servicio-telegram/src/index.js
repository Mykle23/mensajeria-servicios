const amqp = require('amqplib');
const express = require('express');

async function consumeMessages(queue, processMessage) {
  const connection = await amqp.connect('amqp://admin:admin@localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });

  console.log(`Esperando mensajes en la cola ${queue}`);

  let isProcessing = false;

  const processNextMessage = async () => {
    if (isProcessing) return;

    isProcessing = true;

    const msg = await channel.get(queue, { noAck: false });

    if (msg) {
      const message = JSON.parse(msg.content.toString());
      try {
        await processMessage(message);
        channel.ack(msg);
      } catch (error) {
        console.error(`Error procesando mensaje: ${error.message}`);
        channel.nack(msg);
      }
    }

    isProcessing = false;

    // Esperar 1 segundo antes de procesar el siguiente mensaje
    setTimeout(processNextMessage, 100);
  };

  processNextMessage();
}

async function sendToTelegram(message) {
  console.log(`Mensaje recibido de mqtt ${JSON.stringify(message)}`);
  // Aquí iría la integración con la API de Telegram
}

consumeMessages('telegram.messages', sendToTelegram);

// Servidor de healthcheck
const healthApp = express();
healthApp.get('/health', (req, res) => res.sendStatus(200));
healthApp.listen(4000, () => console.log('Telegram service healthcheck en puerto 4000'));
