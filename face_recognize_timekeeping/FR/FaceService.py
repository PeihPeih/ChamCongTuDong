# src/service.py
from .FaceDataset import FaceDataset
from .FaceRecognizer import FaceRecognizer
from config import N_NEIGHBORS, THRESHOLD

class FaceRecognitionService:
    def __init__(self, n_neighbors=N_NEIGHBORS, threshold=THRESHOLD):
        self.recognizer = FaceRecognizer(n_neighbors=n_neighbors, threshold=threshold)
        self.dataset = FaceDataset()

    def train(self):
        """Huấn luyện mô hình."""
        embeddings, labels = self.dataset.load_data()
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