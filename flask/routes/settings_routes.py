from flask import Blueprint, request, jsonify
from database import db
from models.settings import Settings
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from extension_sockets import broadcast_event

settings_bp = Blueprint('settings_bp', __name__)

@settings_bp.route('/api/settings/motivational_message', methods=['GET'])
def get_motivational_message():
    setting = Settings.query.filter_by(key='motivational_message').first()
    message = setting.value if setting else "¡Bienvenido al sistema de tareas! Que tengas un excelente día."
    return jsonify({"message": message}), 200

@settings_bp.route('/api/settings/motivational_message', methods=['POST'])
@jwt_required()
def update_motivational_message():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    if current_user and current_user.role not in ['administrator', 'contributor']:
        return jsonify({'error': 'No tiene permisos para modificar el mensaje motivacional.'}), 403

    data = request.get_json() or {}
    new_message = data.get('message')

    if not new_message:
        return jsonify({'error': 'El mensaje no puede estar vacío.'}), 400

    setting = Settings.query.filter_by(key='motivational_message').first()
    if not setting:
        setting = Settings(key='motivational_message', value=new_message)
        db.session.add(setting)
    else:
        setting.value = new_message

    db.session.commit()

    broadcast_event('new_motivational_message', {"message": new_message})

    return jsonify({"message": new_message}), 200
