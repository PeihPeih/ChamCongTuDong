from fastapi import FastAPI
from mqtt_client import mqtt_run

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    mqtt_run()  

@app.get("/")
def read_root():
    return {"message": "MQTT Service is running"}
