const PORT = process.env.PORT || 5000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://admin:admin@localhost";
module.exports = {
  PORT,
  RABBITMQ_URL,
};
