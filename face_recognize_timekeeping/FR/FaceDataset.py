# face_recognize/FR/FaceDataset.py
import os
import numpy as np
from PIL import Image
import json
from .FaceRecognizer import FaceRecognizer
import albumentations as A


class FaceDataset:
    def __init__(self, recognizer: FaceRecognizer, json_path=None):
        self.dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        self.json_path = json_path  
        self.recognizer = recognizer
        self.augmentation = A.Compose([
            A.Rotate(limit=15, p=0.5),  # Xoay ±15 độ
            A.HorizontalFlip(p=0.5),  # Lật ngang
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5),
            A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.2, rotate_limit=15, p=0.5),
            A.GaussNoise(p=0.2),  
        ])
        self.num_augmentations = 8  


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
                result = self.process_image(image_path, staff_code)
                if result:
                    emb_list, label = result
                    embeddings.extend(emb_list)              # Thêm toàn bộ embedding
                    labels.extend([label] * len(emb_list))   # Nhân bản label tương ứng

        return np.array(embeddings), np.array(labels)
    
    def process_image(self, image_path, label, num_augments=3):
        full_path = os.path.join(self.dataset_path, image_path)
        if not os.path.exists(full_path):
            print(f"Image not found: {full_path}")
            return None

        img = Image.open(full_path).convert("RGB")
        img_np = np.array(img)

        embeddings = []

        # Lấy embedding từ ảnh gốc
        embedding = self.recognizer.get_embedding(img)
        if embedding is not None:
            embeddings.append(embedding)

        # Tạo ảnh augment và lấy embedding
        for _ in range(num_augments):
            augmented = self.augmentation(image=img_np)["image"]
            aug_img_pil = Image.fromarray(augmented)
            aug_embedding = self.recognizer.get_embedding(aug_img_pil)
            if aug_embedding is not None:
                embeddings.append(aug_embedding)

        if embeddings:
            return (embeddings, label)

        print(f"Failed to get embedding for: {full_path}")
        return None
