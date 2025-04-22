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

    def get_embedding(self, image_input):
        """Trích xuất embedding từ ảnh."""
        if isinstance(image_input, str):
        # Đường dẫn ảnh
            img = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, (bytes, bytearray)):
            # Dữ liệu ảnh dạng byte
            img = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif hasattr(image_input, 'read'):
            # File-like object (ví dụ BytesIO)
            img = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            # Đã là ảnh PIL
            img = image_input.convert("RGB")
        else:
            raise TypeError(f"Unsupported image input type: {type(image_input)}")
        
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

    def predict(self, image_base64):
        """Dự đoán danh tính từ chuỗi base64 của ảnh."""
        try:
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            image_data = base64.b64decode(image_base64)

            embedding = self.get_embedding(image_data)
            if embedding is None:
                return {"label": "no_face"}

            if not self.is_trained:
                raise ValueError("Model not trained yet.")

            distances, _ = self.knn.kneighbors([embedding])
            min_distance = distances[0][0]
            predicted_label = self.knn.predict([embedding])[0]

            if min_distance <= self.threshold:
                return {"label": predicted_label}
            return {"label": "unknown"}
        except Exception as e:
            print(f"Error predicting face: {e}")
            return {"label": "error"}


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
        try:
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            if not self.check_face(image):
                return False, "No face detected"
            return True, "Valid face"
        except Exception as e:
            return False, f"Error processing image: {e}"