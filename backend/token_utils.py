"""
JWT token utilities
Centralized token management for authentication
"""
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_secret_key_change_in_production')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv('REFRESH_TOKEN_EXPIRE_DAYS', 7))


def create_access_token(username):
    """Create JWT access token"""
    payload = {
        'username': username,
        'type': 'access',
        'exp': datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def create_refresh_token(username):
    """Create JWT refresh token"""
    payload = {
        'username': username,
        'type': 'refresh',
        'exp': datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token, token_type='access'):
    """
    Verify JWT token
    
    Returns:
        dict: Payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != token_type:
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_token_from_header():
    """
    Extract token from Authorization header
    
    Returns:
        str: Token string or None
    """
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth.split(' ')[1]
    return None


def get_current_user():
    """
    Get current authenticated user from token
    
    Returns:
        str: Username if authenticated, None otherwise
    """
    token = get_token_from_header()
    if not token:
        return None
    
    payload = verify_token(token, 'access')
    if payload:
        return payload['username']
    return None


def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        
        if not token:
            return jsonify({'success': False, 'message': 'Missing or invalid authorization header'}), 401
        
        payload = verify_token(token, 'access')
        
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        request.current_user = payload['username']
        return f(*args, **kwargs)
    return decorated


def is_authenticated():
    """Check if current request is authenticated"""
    return get_current_user() is not None
