// sendBulkMessages.js
const { publishToQueue } = require("./rabbitmq");
const config = require("./config");
function sendBulkMessages() {
  const queue = "telegram.messages";
  const queue2 = "whatsapp.messages";

  for (let i = 0; i < 100; i++) {
    const message = { to: `usuario_${i}`, content: `Mensaje número ${i}` };
    publishToQueue(config.RABBITMQ_URL, queue, message);
  }
  for (let i = 0; i < 100; i++) {
    const message = { to: `usuario_${i}`, content: `Mensaje número ${i}` };
    publishToQueue(config.RABBITMQ_URL, queue2, message);
  }

  console.log("Se han enviado 100 mensajes a la cola");
}

// Ejecutar la función si se llama directamente este archivo
if (require.main === module) {
  sendBulkMessages()
}

sendBulkMessages();
