# src/models/recognizer.py
from facenet_pytorch import MTCNN, InceptionResnetV1
from sklearn.neighbors import KNeighborsClassifier
import joblib
import torch
import numpy as np
from PIL import Image
from config import DEVICE, MODELS_PATH, THRESHOLD, N_NEIGHBORS
import base64
import io

class FaceRecognizer:
    def __init__(self, n_neighbors=N_NEIGHBORS, threshold=THRESHOLD, pretrained='vggface2'):
        self.mtcnn = MTCNN(keep_all=False, device=DEVICE)
        self.model = InceptionResnetV1(pretrained=pretrained).eval().to(DEVICE)
        self.knn = KNeighborsClassifier(n_neighbors=n_neighbors, metric='euclidean')
        self.threshold = threshold
        self.is_trained = False

    def get_embedding(self, image_path):
        """Trích xuất embedding từ ảnh."""
        img = Image.open(image_path)
        img_cropped = self.mtcnn(img)
        if img_cropped is None:
            return None
        img_cropped = img_cropped.unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            embedding = self.model(img_cropped).cpu().numpy()
        return embedding.flatten()

    def train(self, embeddings, labels):
        """Huấn luyện mô hình KNN."""
        self.knn.fit(embeddings, labels)
        self.is_trained = True

    def predict(self, image_path):
        """Dự đoán danh tính từ ảnh."""
        embedding = self.get_embedding(image_path)
        if embedding is None:
            return "No face detected"
        if not self.is_trained:
            raise ValueError("Model not trained yet.")
        distances, _ = self.knn.kneighbors([embedding])
        min_distance = distances[0][0]
        if min_distance <= self.threshold:
            return self.knn.predict([embedding])[0]
        return "unknown"

    def save_model(self, path=f"{MODELS_PATH}/knn_model.pkl"):
        """Lưu mô hình KNN."""
        joblib.dump(self.knn, path)

    def load_model(self, path=f"{MODELS_PATH}/knn_model.pkl"):
        """Tải mô hình KNN."""
        self.knn = joblib.load(path)
        self.is_trained = True

    def check_face(self, image):
        """Kiểm tra xem ảnh có chứa 1 khuôn mặt hay không"""
        try:
            faces = self.mtcnn(image)
            if faces is None:
                return False
        except Exception as e:
            print(f"Error checking face in image: {e}")
            return False
        return True
        
    def check_face_from_base64(self, image_base64):
        """Kiểm tra xem ảnh từ chuỗi base64 có chứa khuôn mặt hay không."""
        try:
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            return self.check_face(image)
        except Exception as e:
            print(f"Error processing base64 image: {e}")
            return False
        
    def retrain_model(self, embeddings, labels):
        pass