from FR.FaceService import FaceRecognitionService
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
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