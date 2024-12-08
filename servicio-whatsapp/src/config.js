const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://admin:admin@localhost";
module.exports = {
  RABBITMQ_URL,
};
