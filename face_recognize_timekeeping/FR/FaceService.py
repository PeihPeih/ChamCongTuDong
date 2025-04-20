# src/service.py
from .FaceDataset import FaceDataset
from .FaceRecognizer import FaceRecognizer
from config import N_NEIGHBORS, THRESHOLD, BACKEND_API
import httpx

class FaceRecognitionService:
    def __init__(self, n_neighbors=N_NEIGHBORS, threshold=THRESHOLD):
        self.recognizer = FaceRecognizer(n_neighbors=n_neighbors, threshold=threshold)
        self.dataset = FaceDataset()

    def train(self, json_data = None):
        """Huấn luyện mô hình."""
        embeddings, labels = self.dataset.load_data(json_data=json_data)
        self.recognizer.train(embeddings, labels)
        self.recognizer.save_model()

    def predict(self, image_path):
        """Dự đoán danh tính từ ảnh."""
        return self.recognizer.predict(image_path)

    def load_model(self):
        """Tải mô hình đã huấn luyện."""
        self.recognizer.load_model()

    def check_face(self, image_base64):
        return self.recognizer.check_face_from_base64(image_base64)
    
    async def retrain_model(self):
        """Huấn luyện lại mô hình."""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_API}/api/images/get-all")
            if response.status_code != 200:
                print("Failed to get face data from backend API")
                return False
            
            data = response.json()
            if data["stt"] != 1000:
                print("Error in response from backend API")
                return False
            
            json_data = data["data"]

            self.train(json_data=json_data)
            self.recognizer.save_model()
            return True