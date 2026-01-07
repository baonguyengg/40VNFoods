"""
Flask API Backend for Vietnamese Food Classification
Handles image upload and model prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys
from PIL import Image
import base64
import io
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import MODEL_PATH
from model_utils import load_ml_model, predict_image, get_food_info, get_food_classes
from token_utils import (
    create_access_token, create_refresh_token, verify_token, 
    token_required, get_current_user, is_authenticated,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from history_utils import save_prediction_history, get_prediction_history, delete_history_item, delete_all_history
from user_utils import create_user, check_user_password

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Custom rate limit key function - phân biệt user login vs chưa login
def get_rate_limit_key():
    """
    Rate limit key:
    - User đã login (có valid token) → limit theo username
    - User chưa login → limit theo IP
    """
    username = get_current_user()
    if username:
        return f"user:{username}"
    return f"ip:{get_remote_address()}"

# Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_rate_limit_key,
    default_limits=["200 per hour"],
    storage_uri="memory://"
)

# Load model at startup
load_ml_model()

# Health check endpoint (cho Render/monitoring)
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment platforms"""
    return jsonify({
        'status': 'healthy',
        'service': 'Vietnamese Food Recognition API',
        'version': '1.0.0'
    })

# Đăng ký người dùng
@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    ok, msg = create_user(username, password)
    if ok:
        return jsonify({'success': True, 'message': 'User created successfully'})
    else:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

# Đăng nhập người dùng
@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    if not check_user_password(username, password):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Tạo access và refresh tokens
    access_token = create_access_token(username)
    refresh_token = create_refresh_token(username)
    
    return jsonify({
        'success': True,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer',
        'expires_in': ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        'username': username
    })

# API refresh token
@app.route('/api/refresh', methods=['POST'])
@limiter.limit("20 per minute")
def refresh():
    """Refresh access token using refresh token"""
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'success': False, 'message': 'Refresh token required'}), 400
    
    payload = verify_token(refresh_token, 'refresh')
    if not payload:
        return jsonify({'success': False, 'message': 'Invalid or expired refresh token'}), 401
    
    # Tạo access token mới
    username = payload['username']
    new_access_token = create_access_token(username)
    
    return jsonify({
        'success': True,
        'access_token': new_access_token,
        'token_type': 'Bearer',
        'expires_in': ACCESS_TOKEN_EXPIRE_MINUTES * 60
    })

# API lấy lịch sử dự đoán gần nhất
@app.route('/api/history', methods=['GET'])
@limiter.limit("30 per minute")
@token_required
def get_history():
    try:
        limit = int(request.args.get('limit', 20))
        username = request.current_user
        history = get_prediction_history(username, limit=limit)
        return jsonify({
            'success': True,
            'history': history,
            'username': username
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# API xóa toàn bộ lịch sử dự đoán
@app.route('/api/history', methods=['DELETE'])
@limiter.limit("5 per minute")
@token_required
def delete_history():
    try:
        username = request.current_user
        delete_all_history(username)
        return jsonify({
            'success': True,
            'message': 'History deleted',
            'deleted_by': username
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# API xóa một record lịch sử
@app.route('/api/history/<item_id>', methods=['DELETE'])
@limiter.limit("20 per minute")
@token_required
def delete_history_item_route(item_id):
    try:
        username = request.current_user
        if delete_history_item(username, item_id):
            return jsonify({
                'success': True,
                'message': 'History item deleted',
                'deleted_by': username
            })
        else:
            return jsonify({'success': False, 'message': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
@limiter.limit(
    "5 per 10 minute",  # User chưa login: 5 requests / 10 phút
    exempt_when=is_authenticated
)
@limiter.limit(
    "30 per 10 minute",  # User đã login: 30 requests / 10 phút
    key_func=lambda: get_rate_limit_key() if is_authenticated() else None
)
def predict():
    """Predict food from uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['image']
        lang = request.form.get('lang', 'VN')
        
        img = Image.open(file.stream).convert('RGB')
        
        # Convert to base64 for history
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Predict using model_utils
        food_name, confidence, related = predict_image(img, top_k=4)
        food_info = get_food_info(food_name, lang)
        
        if not food_info:
            return jsonify({'success': False, 'error': 'Food information not found'}), 404

        # Lưu lịch sử nếu user đã đăng nhập
        username = get_current_user()
        if username:
            try:
                save_prediction_history(username, food_name, confidence, image_base64=img_base64)
            except Exception as e:
                logger.warning(f"Failed to save history: {e}")

        return jsonify({
            'success': True,
            'food_name': food_name,
            'confidence': confidence,
            'food_info': food_info,
            'related': related
        })
    
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/foods/search', methods=['GET'])
@limiter.limit("60 per minute")
def search_foods():
    """Search foods with pagination and region filter"""
    try:
        lang = request.args.get('lang', 'VN')
        search = request.args.get('search', '').lower().strip()
        region = request.args.get('region', 'all')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        
        classes = get_food_classes()
        
        filtered_foods = []
        for food_name in classes:
            info = get_food_info(food_name, lang)
            if not info:
                continue
            
            if region != 'all' and info.get('region') != region:
                continue
            
            if search and search not in food_name.lower() and search not in info.get('description', '').lower():
                continue
            
            filtered_foods.append({'id': food_name, **info})
        
        total = len(filtered_foods)
        total_pages = max(1, (total + per_page - 1) // per_page)
        page = max(1, min(page, total_pages))
        
        start = (page - 1) * per_page
        end = start + per_page
        foods = filtered_foods[start:end]
        
        return jsonify({
            'success': True,
            'foods': foods,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/food/<food_name>', methods=['GET'])
@limiter.limit("60 per minute")
def get_food_detail(food_name):
    """Get detailed info for specific food"""
    try:
        lang = request.args.get('lang', 'VN')
        info = get_food_info(food_name, lang)
        
        if not info:
            return jsonify({'success': False, 'error': 'Food not found'}), 404
        
        return jsonify({
            'success': True,
            'food': info
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    # Get configuration from environment
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    
    logger.info("="*50)
    logger.info("Starting Flask API Server")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    logger.info(f"Port: {port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"Model path: {MODEL_PATH}")
    logger.info("="*50)
    logger.info("Available endpoints:")
    logger.info("  Health: GET /api/health")
    logger.info("  Auth: POST /api/register, /api/login, /api/refresh")
    logger.info("  Food: POST /api/predict, GET /api/food/<name>, /api/foods/search")
    logger.info("  History: GET /api/history, DELETE /api/history[/<id>]")
    logger.info("="*50)
    
    app.run(debug=debug, host='0.0.0.0', port=port)
