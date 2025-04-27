import paho.mqtt.client as mqtt
import ssl
import json
import os
import asyncio
from FR.FaceService import FaceRecognitionService
import index

MQTT_HOST = os.getenv("MQTT_HOST")
MQTT_PORT = 8883
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")

def setup_mqtt(recognizer: FaceRecognitionService):
    def on_connect(client, userdata, flags, rc):
        print("Connected to MQTT broker")
        client.subscribe("topic/retrain_model")
        client.subscribe("topic/recognize_auth")  # Đăng ký thêm topic recognize_auth

    def on_message(client, userdata, msg):
        print(f"Message on {msg.topic}: {msg.payload.decode()}")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            if msg.topic == "topic/retrain_model":
                loop.run_until_complete(recognizer.retrain_model())
            elif msg.topic == "topic/recognize_auth":
                payload = json.loads(msg.payload.decode())
                image_base64 = payload.get("image_base64")
                timestamp = payload.get("timestamp")
                if image_base64 and timestamp:
                    asyncio.run(index.process_face_recognition(image_base64, timestamp))
                else:
                    print("Invalid payload: missing image_base64 or timestamp")
        finally:
            loop.close()

    client = mqtt.Client(userdata=recognizer)  
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.tls_set(tls_version=ssl.PROTOCOL_TLS)
    client.tls_insecure_set(True)

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(MQTT_HOST, MQTT_PORT, 60)
    client.loop_start()
    print("MQTT client started at host:", MQTT_HOST, "port:", MQTT_PORT)
    return client