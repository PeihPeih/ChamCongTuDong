import torch

MODELS_PATH = "models/"
N_NEIGHBORS = 5
THRESHOLD = 0.8 # Xét khoảng cách giữa các vector để phát hiện người lạ
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BACKEND_API = "http://localhost:8888"