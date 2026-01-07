"""
Model utilities for loading and prediction
Centralized model management to avoid code duplication
"""
import os
import sys
import json
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.inception_v3 import preprocess_input
import logging

logger = logging.getLogger(__name__)

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import FOOD_DATABASE, MODEL_PATH, IMAGE_SIZE

# Global cache
_model = None
_food_classes_cache = None


def load_ml_model():
    """Load TensorFlow model (singleton pattern)"""
    global _model
    
    if _model is not None:
        return _model
    
    try:
        # Adjust path to go from backend/ to root directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, MODEL_PATH)
        
        if os.path.exists(model_path):
            _model = load_model(model_path, compile=False)
            logger.info(f"Model loaded successfully from {model_path}")
        else:
            logger.error(f"Model not found at {model_path}")
            raise FileNotFoundError(f"Model not found at {model_path}")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise
    
    return _model


def get_food_classes():
    """Get list of food classes in ORIGINAL order from JSON (cached)"""
    global _food_classes_cache
    if _food_classes_cache is None:
        _food_classes_cache = list(FOOD_DATABASE.keys())
    return _food_classes_cache


def preprocess_image_data(img):
    """Preprocess PIL Image for InceptionV3 prediction"""
    img = img.resize(IMAGE_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array


def predict_image(img, top_k=4):
    """
    Predict food from PIL Image
    
    Args:
        img: PIL Image object
        top_k: Number of top predictions to return
        
    Returns:
        tuple: (top_food_name, confidence, related_foods_list)
    """
    model = load_ml_model()
    
    img_array = preprocess_image_data(img)
    pred_probs = model.predict(img_array, verbose=0)[0]
    
    classes = get_food_classes()
    top_indices = np.argpartition(pred_probs, -top_k)[-top_k:]
    top_indices = top_indices[np.argsort(pred_probs[top_indices])][::-1]
    
    food_name = classes[top_indices[0]]
    confidence = float(pred_probs[top_indices[0]] * 100)
    related = [classes[i] for i in top_indices[1:top_k]]
    
    return food_name, confidence, related


def get_food_info(food_name, lang='VN'):
    """Get food information in specified language"""
    if food_name not in FOOD_DATABASE:
        return None
    
    food = FOOD_DATABASE[food_name]
    lang_suffix = '' if lang == 'VN' else '_en'
    
    return {
        'name': food_name if lang == 'VN' else food.get('name_en', food_name),
        'region': food['region'],
        'description': food.get(f'description{lang_suffix}', food['description_vn']),
        'ingredients': food.get(f'ingredients{lang_suffix}', food['ingredients_vn']),
        'related': food.get('related', [])
    }
