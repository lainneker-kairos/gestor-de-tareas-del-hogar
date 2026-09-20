import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from database import db
from models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'member')
    is_child = data.get('is_child', False)

    if not username or not email or not password:
        return jsonify({'error': 'Todos los campos (username, email, password) son obligatorios.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'El nombre de usuario ya existe.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'El correo electrónico ya está registrado.'}), 400

    user = User(username=username, email=email, role=role, is_child=is_child)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Usuario registrado exitosamente.',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username_or_email = data.get('username') or data.get('email')
    password = data.get('password')

    if not username_or_email or not password:
        return jsonify({'error': 'Proporcione usuario/email y contraseña.'}), 400

    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Credenciales inválidas.'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Inicio de sesión exitoso.',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404
    return jsonify(user.to_dict()), 200

@auth_bp.route('/api/auth/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@auth_bp.route('/api/auth/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    data = request.get_json() or {}
    current_password = data.get('current_password') or data.get('currentPassword')
    new_password = data.get('new_password') or data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({'error': 'La contraseña actual y la nueva contraseña son obligatorias.'}), 400

    if not user.check_password(current_password):
        return jsonify({'error': 'La contraseña actual es incorrecta.'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 6 caracteres.'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Contraseña actualizada exitosamente.'}), 200

@auth_bp.route('/api/auth/avatar', methods=['POST'])
@jwt_required()
def update_avatar():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    # Handle image file upload
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename != '':
            ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
            allowed = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
            if ext not in allowed:
                return jsonify({'error': 'Formato de imagen no soportado. Use PNG, JPG, WEBP o SVG.'}), 400

            filename = secure_filename(f"user_{user.id}_{int(datetime.utcnow().timestamp())}.{ext}")
            upload_folder = os.path.join(current_app.root_path, 'uploads', 'avatars')
            os.makedirs(upload_folder, exist_ok=True)

            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)

            user.avatar_url = f"/api/auth/avatars/{filename}"
            db.session.commit()
            return jsonify({
                'message': 'Foto de perfil actualizada exitosamente.',
                'user': user.to_dict(),
                'avatar_url': user.avatar_url
            }), 200

    # Handle JSON preset or custom URL
    data = request.get_json() or {}
    avatar_url = data.get('avatar_url')
    if avatar_url:
        user.avatar_url = avatar_url
        db.session.commit()
        return jsonify({
            'message': 'Foto de perfil actualizada exitosamente.',
            'user': user.to_dict(),
            'avatar_url': user.avatar_url
        }), 200

    return jsonify({'error': 'Proporcione un archivo de imagen o una URL de avatar.'}), 400

@auth_bp.route('/api/auth/avatars/<filename>', methods=['GET'])
def get_avatar_file(filename):
    upload_folder = os.path.join(current_app.root_path, 'uploads', 'avatars')
    return send_from_directory(upload_folder, filename)


