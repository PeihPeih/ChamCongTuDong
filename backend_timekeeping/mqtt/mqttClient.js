import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { saveTimekeepingFromMQTT } from "../controller/timekeepingController.js";

dotenv.config();

const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: 8883,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  protocol: 'mqtts'
});

client.on('connect', () => {
  console.log(`MQTT connected to ${process.env.MQTT_HOST}`);
  client.subscribe("topic/face-recognize/result", { qos: 1 }, (err) => {
    if (err) {
      console.error("MQTT subscribe error:", err.message);
    } else {
      console.log("Subscribed to topic/face-recognize/result");
    }
  });
});

client.on('message', async (topic, message) => {
  if (topic === "topic/face-recognize/result") {
    try {
      const payload = JSON.parse(message.toString());
      const { stt, data } = payload;
      console.log("stt ", stt)
      console.log("-----------------------------")
      if (stt === 1000) {
        const { label, timestamp } = data;
        await saveTimekeepingFromMQTT(label, timestamp); // Xử lý ghi DB
      } else {
        console.warn("Unknown face - không ghi worklog");
      }
    } catch (err) {
      console.error("MQTT message error:", err.message);
    }
  }
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