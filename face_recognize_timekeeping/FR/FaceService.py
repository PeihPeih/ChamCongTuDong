# src/service.py
from .FaceDataset import FaceDataset
from .FaceRecognizer import FaceRecognizer
from config import N_NEIGHBORS, THRESHOLD
import httpx
import dotenv
import os

dotenv.load_dotenv()

BACKEND_API = os.environ.get("BACKEND_API", "http://localhost:3000")  # Địa chỉ API backend của bạn

class FaceRecognitionService:
    def __init__(self, n_neighbors=N_NEIGHBORS, threshold=THRESHOLD):
        self.recognizer = FaceRecognizer(n_neighbors=n_neighbors, threshold=threshold)
        self.dataset = FaceDataset(self.recognizer)

    def train(self, json_data = None):
        """Huấn luyện mô hình."""
        embeddings, labels = self.dataset.load_data(json_data=json_data)
        if embeddings.size == 0 or labels.size == 0:
            print("No data to train the model.")
            return
        self.recognizer.train(embeddings, labels)
        self.recognizer.save_model()

    def predict(self, image_base64):
        """Dự đoán danh tính từ ảnh."""
        return self.recognizer.predict(image_base64)

    def load_model(self):
        """Tải mô hình đã huấn luyện."""
        self.recognizer.load_model()

    def check_face(self, image_base64):
        return self.recognizer.check_face_from_base64(image_base64)
    
    async def retrain_model(self):
        """Huấn luyện lại mô hình."""
        print("[Retrain Model] Start retraining model")
        print("--------------------------------------")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:  # timeout toàn cục 10s
                response = await client.get(f"{BACKEND_API}/api/images/get-all")

                if response.status_code != 200:
                    print("Failed to get face data from backend API")
                    return False

                data = response.json()
                if data.get("stt") != 1000:
                    print("Error in response from backend API")
                    return False

                json_data = data["data"]
                self.train(json_data=json_data)
                print("[Retrain Model] Model retraining completed")
                return True

        except httpx.TimeoutException:
            print("Request timed out while trying to fetch face data.")
            return False
        except httpx.ConnectError:
            print("Failed to connect to the backend API.")
            return False
        except httpx.HTTPError as e:
            print(f"An HTTP error occurred: {str(e)}")
            return False