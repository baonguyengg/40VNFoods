"""History management utilities for per-user prediction history"""
import os
import uuid
import logging
from datetime import datetime
from file_utils import load_json_file, save_json_file

logger = logging.getLogger(__name__)

HISTORY_DIR = os.path.join(os.path.dirname(__file__), 'data', 'history')

if not os.path.exists(HISTORY_DIR):
    os.makedirs(HISTORY_DIR)

def get_user_history_path(username):
    """Lấy đường dẫn file lịch sử cho một user cụ thể"""
    return os.path.join(HISTORY_DIR, f'{username.lower()}.json')

def save_prediction_history(username, food_name, confidence, image_base64=None):
    """Lưu lịch sử dự đoán cho user"""
    try:
        record = {
            '_id': str(uuid.uuid4()),
            'timestamp': datetime.now().isoformat(),
            'food_name': food_name,
            'confidence': confidence,
            'image_base64': image_base64
        }
        
        user_history_path = get_user_history_path(username)
        
        # Đọc dữ liệu hiện có
        data = load_json_file(user_history_path, default=[])
        data.append(record)
        
        # Ghi lại file
        if save_json_file(user_history_path, data):
            logger.info(f"History saved for user: {username}, food: {food_name}")
        else:
            logger.error(f"Failed to save history for {username}")
    except Exception as e:
        logger.error(f"Failed to save history for {username}: {e}")

def get_prediction_history(username, limit=50):
    """Lấy lịch sử dự đoán của một user (mới nhất trước)"""
    user_history_path = get_user_history_path(username)
    data = load_json_file(user_history_path, default=[])
    return data[-limit:][::-1]

def delete_history_item(username, item_id):
    """Xóa một record lịch sử theo ID"""
    user_history_path = get_user_history_path(username)
    data = load_json_file(user_history_path, default=[])
    
    original_len = len(data)
    data = [item for item in data if item.get('_id') != item_id]
    
    if len(data) == original_len:
        return False
    
    if save_json_file(user_history_path, data):
        logger.info(f"Deleted history item {item_id} for user: {username}")
        return True
    return False

def delete_all_history(username):
    """Xóa toàn bộ lịch sử của một user"""
    user_history_path = get_user_history_path(username)
    
    if save_json_file(user_history_path, []):
        logger.info(f"Cleared all history for user: {username}")
        return True
    logger.error(f"Failed to clear history for {username}")
    return False
