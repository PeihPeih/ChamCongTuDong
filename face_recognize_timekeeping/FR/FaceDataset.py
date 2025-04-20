# face_recognize/FR/FaceDataset.py
import os
import numpy as np
from PIL import Image
import json
from .FaceRecognizer import FaceRecognizer

class FaceDataset:
    def __init__(self, json_path=None):
        self.dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        self.json_path = json_path  
        self.recognizer = FaceRecognizer()  

    def load_data(self, json_data=None):
        embeddings = []
        labels = []

        if json_data is None:
            if self.json_path is None or not os.path.exists(self.json_path):
                raise ValueError("JSON path is not provided or does not exist.")
            with open(self.json_path, 'r') as f:
                json_data = json.load(f)

        for staff in json_data:
            staff_code = staff.get('staffCode')  
            image_paths = staff.get('imagePaths', [])  

            for image_path in image_paths:
                full_image_path = os.path.join(self.dataset_path, image_path)

                if not os.path.exists(full_image_path):
                    print(f"Image not found: {full_image_path}")
                    continue

                embedding = self.recognizer.get_embedding(full_image_path)
                if embedding is not None:
                    embeddings.append(embedding)
                    labels.append(staff_code)
                else:
                    print(f"Failed to get embedding for: {full_image_path}")

        return np.array(embeddings), np.array(labels)