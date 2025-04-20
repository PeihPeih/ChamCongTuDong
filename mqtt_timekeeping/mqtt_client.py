import paho.mqtt.client as mqtt
import threading
from config import MQTT_BROKER, MQTT_PORT, MQTT_TOPIC
from services.handle_face_data import handle_message

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"Received on {msg.topic}: {payload}")
    handle_message(payload)

def mqtt_run():
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)

    thread = threading.Thread(target=client.loop_forever)
    thread.start()