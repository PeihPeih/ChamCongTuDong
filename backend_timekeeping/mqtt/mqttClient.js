import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: 8883,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  protocol: 'mqtts'
});

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${process.env.MQTT_HOST} on port 8883`);
});

export const publishMessage = (topic, message) => {
    if (!topic || !message) {
      console.error("[MQTT] Thiếu topic hoặc message!");
      return;
    }
  
    const payload = JSON.stringify(message);
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT] Lỗi khi publish:", err.message);
      } else {
        console.log(`[MQTT] Đã gửi đến topic "${topic}" với payload:`, payload);
      }
    });
  };
