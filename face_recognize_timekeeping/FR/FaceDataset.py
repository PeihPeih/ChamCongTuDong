# src/data/dataset.py
import os
import numpy as np
from PIL import Image
from .FaceRecognizer import FaceRecognizer

class FaceDataset:
    def __init__(self, dataset_path="."):
        self.dataset_path = dataset_path
        self.recognizer = FaceRecognizer()  # Khởi tạo FaceRecognizer

    def load_data(self):
        """Load dữ liệu và trích xuất embedding."""
        embeddings = []
        labels = []
        for person_name in os.listdir(self.dataset_path):
            person_dir = os.path.join(self.dataset_path, person_name)
            if not os.path.isdir(person_dir):
                continue
            for image_name in os.listdir(person_dir):
                image_path = os.path.join(person_dir, image_name)
                embedding = self.recognizer.get_embedding(image_path)
                if embedding is not None:
                    embeddings.append(embedding)
                    labels.append(person_name)
        return np.array(embeddings), np.array(labels)