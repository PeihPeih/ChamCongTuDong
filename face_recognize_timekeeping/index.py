from FR.FaceService import FaceRecognitionService
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code chạy khi server khởi động
    print("[Startup] Start retraining model")
    try:
        await recognizer.retrain_model()
        print("[Startup] Model retraining completed")
    except Exception as e:
        print(f"[Startup] Error retraining model: {e}")
        # Có thể raise e nếu muốn dừng server khi lỗi xảy ra
        # raise e

    yield  # Server chạy bình thường sau khi startup hoàn tất

    # Code chạy khi server tắt (nếu cần)
    print("[Shutdown] Server is shutting down")

app = FastAPI(lifespan=lifespan)
recognizer = FaceRecognitionService()

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
    
@app.post("/api/retrain-model")
async def retrain_model():
    try:
        print("[Retrain Model] Start retraining model")
        recognizer.retrain_model()
        print("[Retrain Model] Model retraining completed")
        return {"message": "Đã huấn luyện lại mô hình thành công", "stt": 1000}
    except Exception as e:
        print(f"Error retraining model: {e}")
        return {"message": "Có lỗi xảy ra khi huấn luyện lại mô hình", "error": str(e), "stt": 1001}