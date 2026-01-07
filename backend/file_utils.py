"""
File utilities for JSON I/O operations
Provides consistent error handling for file operations
"""
import json
import os
import logging

logger = logging.getLogger(__name__)


def load_json_file(file_path, default=None):
    """
    Load JSON file with error handling
    
    Args:
        file_path: Path to JSON file
        default: Default value if file doesn't exist or has errors
        
    Returns:
        Loaded data or default value
    """
    if default is None:
        default = []
    
    if not os.path.exists(file_path):
        return default
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.warning(f"Failed to read {file_path}: {e}")
        return default


def save_json_file(file_path, data, indent=2):
    """
    Save data to JSON file with error handling
    
    Args:
        file_path: Path to JSON file
        data: Data to save
        indent: Indentation level (default: 2)
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Ensure directory exists
        dir_path = os.path.dirname(file_path)
        if dir_path and not os.path.exists(dir_path):
            os.makedirs(dir_path)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=indent)
        return True
    except IOError as e:
        logger.error(f"Failed to write {file_path}: {e}")
        return False


def update_json_file(file_path, update_fn, default=None):
    """
    Load, update, and save JSON file atomically
    
    Args:
        file_path: Path to JSON file
        update_fn: Function that takes data and returns updated data
        default: Default value if file doesn't exist
        
    Returns:
        bool: True if successful, False otherwise
    """
    if default is None:
        default = []
    
    data = load_json_file(file_path, default)
    updated_data = update_fn(data)
    return save_json_file(file_path, updated_data)
