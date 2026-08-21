import json
import threading
import time

import pika

from config.settings import (
    NOTIFICATION_QUEUE,
    RABBITMQ_HOST,
    RABBITMQ_PASSWORD,
    RABBITMQ_PORT,
    RABBITMQ_URL,
    RABBITMQ_USER,
    RABBITMQ_VHOST,
)
from notification_app.controller.Notification_controller import NotificationController


def _connection_parameters():
    if RABBITMQ_URL:
        return pika.URLParameters(RABBITMQ_URL)

    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    return pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        virtual_host=RABBITMQ_VHOST,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300,
    )


def start_consumer(app):
    def run():
        retry_delay = 5
        max_retry_delay = 60

        while True:
            try:
                print(
                    f"Connecting to RabbitMQ at {RABBITMQ_HOST}:{RABBITMQ_PORT} "
                    f"(queue: {NOTIFICATION_QUEUE})..."
                )
                connection = pika.BlockingConnection(_connection_parameters())
                channel = connection.channel()
                channel.queue_declare(queue=NOTIFICATION_QUEUE, durable=True)
                retry_delay = 5

                def callback(ch, method, properties, body):
                    try:
                        data = json.loads(body)
                        user_id = data.get("user_id")
                        with app.app_context():
                            NotificationController.send_notification(data, user_id)
                    except Exception as error:
                        print(f"Failed to process notification message: {error}")

                channel.basic_consume(
                    queue=NOTIFICATION_QUEUE,
                    on_message_callback=callback,
                    auto_ack=True,
                )
                print("RabbitMQ consumer connected and listening.")
                channel.start_consuming()
            except Exception as error:
                print(
                    f"RabbitMQ consumer unavailable ({error}); "
                    f"retrying in {retry_delay}s..."
                )
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_retry_delay)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
