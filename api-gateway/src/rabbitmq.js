const amqp = require("amqplib");

async function publishToQueue(RABBITMQ_URL, queue, message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });
  console.log(`Mandando mensaje a ${queue}: ${JSON.stringify(message)}`);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  await channel.close();
  await connection.close();
}

/**
 * Consume mensajes de una cola específica de RabbitMQ.
 * @param {string} queue - Nombre de la cola.
 * @param {function} processMessage - Función para procesar el mensaje.
 */
async function consumeFromQueue(RABBITMQ_URL, queue, processMessage) {
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
module.exports = { publishToQueue, consumeFromQueue };
