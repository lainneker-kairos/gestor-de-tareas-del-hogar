import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from database import db
from models.schedule import Schedule
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extension_sockets import broadcast_event

schedule_bp = Blueprint('schedule_bp', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@schedule_bp.route('/api/schedules', methods=['GET'])
@jwt_required()
def get_schedules():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    user_id_param = request.args.get('user_id')
    if user_id_param and user and user.role in ['administrator', 'contributor']:
        schedules = Schedule.query.filter_by(user_id=int(user_id_param)).all()
    elif user and user.role in ['administrator', 'contributor'] and request.args.get('all') == 'true':
        schedules = Schedule.query.all()
    else:
        schedules = Schedule.query.filter_by(user_id=int(current_user_id)).all()

    return jsonify([s.to_dict() for s in schedules]), 200

@schedule_bp.route('/api/schedules', methods=['POST'])
@jwt_required()
def create_schedule():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}

    day_of_week = data.get('day_of_week', 'Lunes')
    start_time = data.get('start_time', '08:00')
    end_time = data.get('end_time', '17:00')
    note = data.get('note', '')
    target_user_id = data.get('user_id', current_user_id)

    schedule = Schedule(
        user_id=int(target_user_id),
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time,
        note=note
    )

    db.session.add(schedule)
    db.session.commit()

    schedule_data = schedule.to_dict()
    broadcast_event('schedule_updated', schedule_data)

    return jsonify(schedule_data), 201

@schedule_bp.route('/api/schedules/upload', methods=['POST'])
@jwt_required()
def upload_schedule_file():
    current_user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No se envió ningún archivo.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío.'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        file_url = f"/api/schedules/files/{filename}"

        day_of_week = request.form.get('day_of_week', 'General')
        note = request.form.get('note', 'Documento de horario adjunto')

        schedule = Schedule(
            user_id=int(current_user_id),
            day_of_week=day_of_week,
            start_time='00:00',
            end_time='23:59',
            note=note,
            file_url=file_url,
            file_name=filename
        )

        db.session.add(schedule)
        db.session.commit()

        schedule_data = schedule.to_dict()
        broadcast_event('schedule_updated', schedule_data)

        return jsonify({
            'message': 'Archivo de horario subido exitosamente.',
            'schedule': schedule_data
        }), 201

    return jsonify({'error': 'Tipo de archivo no permitido.'}), 400

@schedule_bp.route('/api/schedules/files/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    return send_from_directory(upload_folder, filename)

@schedule_bp.route('/api/schedules/<int:schedule_id>', methods=['DELETE'])
@jwt_required()
def delete_schedule(schedule_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Horario no encontrado.'}), 404

    if schedule.user_id != int(current_user_id) and (not user or user.role not in ['administrator', 'contributor']):
        return jsonify({'error': 'No tiene permisos para eliminar este horario.'}), 403

    db.session.delete(schedule)
    db.session.commit()

    broadcast_event('schedule_deleted', {'id': schedule_id})
    return jsonify({'message': 'Horario eliminado exitosamente.', 'id': schedule_id}), 200
