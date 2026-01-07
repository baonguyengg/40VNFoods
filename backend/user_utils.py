import os
from flask_bcrypt import Bcrypt
from file_utils import load_json_file, save_json_file

USERS_PATH = os.path.join(os.path.dirname(__file__), 'data', 'users.json')

def load_users():
    return load_json_file(USERS_PATH, default=[])

def save_users(users):
    return save_json_file(USERS_PATH, users)

def find_user_by_username(username):
    users = load_users()
    for user in users:
        if user['username'] == username:
            return user
    return None

def create_user(username, password):
    bcrypt = Bcrypt()
    users = load_users()
    if any(u['username'] == username for u in users):
        return False, 'Username already exists'
    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user = {'username': username, 'password': hashed}
    users.append(user)
    save_users(users)
    return True, 'User created'

def check_user_password(username, password):
    bcrypt = Bcrypt()
    user = find_user_by_username(username)
    if not user:
        return False
    return bcrypt.check_password_hash(user['password'], password)
