from FR.FaceService import FaceRecognitionService
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from mqtt.mqtt_client import setup_mqtt
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        asyncio.create_task(recognizer.retrain_model())
        print("[Startup] Retraining model in the background")
    except Exception as e:
        print(f"[Startup] Error retraining model: {e}")

    yield 

    print("[Shutdown] Application is shutting down")


app = FastAPI(lifespan=lifespan)
recognizer = FaceRecognitionService()
mqtt_client = setup_mqtt(recognizer)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return "Hello AI Service!"

# Check xem ảnh có chứa mặt người ko
@app.post("/api/check-frontal-face")
async def check_face_base64(image_base64: str = Body(..., embed=True)):
    try:
        has_face = recognizer.check_face(image_base64)
        
        if has_face:
            return {"message": "Ảnh tải lên hợp lệ","stt": 1000}
        else:
            return {"message": "Ảnh không chứa khuôn mặt", "stt": 1001}
    except Exception as e:
        print(f"Error checking face: {e}")
        return {"message": "Có lỗi xảy ra khi kiểm tra khuôn mặt", "error": str(e), "stt": 1002}
    
@app.post("/api/recognize-face")
async def recognize_face(image_base64: str = Body(..., embed=True)):
    try:
        has_face, message = recognizer.check_face(image_base64)
        if not has_face:
            return {"message": message, "stt": 1001}

        result = recognizer.predict(image_base64)

        return {
            "message": "Nhận diện khuôn mặt thành công",
            "stt": 1000,
            "data": {
                "label": result["label"],
            }
        }
    except Exception as e:
        print(f"Error recognizing face: {e}")
        return {"message": "Có lỗi xảy ra khi nhận diện khuôn mặt", "error": str(e), "stt": 1002}