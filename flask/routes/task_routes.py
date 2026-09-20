from flask import Blueprint, request, jsonify
from database import db
from models.task import Task, TaskCatalog
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from extension_sockets import broadcast_event

task_bp = Blueprint('task_bp', __name__)

RESTRICTED_COOKING_TASKS = [
    "preparar desayuno",
    "preparar almuerzo",
    "preparar cena"
]

def check_child_restriction(user, task_title):
    if not user:
        return False, None
    
    is_child_user = user.is_child or (user.username and user.username.lower() == 'gabriela')
    is_cooking_task = any(r_task in task_title.lower().strip() for r_task in RESTRICTED_COOKING_TASKS)
    
    if is_child_user and is_cooking_task:
        return True, f"Restricción de seguridad: La tarea '{task_title}' no se puede asignar al usuario infantil '{user.username}'."
    
    return False, None

@task_bp.route('/api/tasks/catalog', methods=['GET'])
def get_catalog():
    catalog_items = TaskCatalog.query.all()
    return jsonify([item.to_dict() for item in catalog_items]), 200

@task_bp.route('/api/tasks/catalog', methods=['POST'])
@jwt_required()
def create_catalog_item():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    if current_user and current_user.role not in ['administrator', 'contributor']:
        return jsonify({'error': 'No tiene permisos para agregar al catálogo.'}), 403

    data = request.get_json() or {}
    title = data.get('title')
    default_duration = data.get('default_duration', 30)
    category = data.get('category', 'Hogar')

    if not title:
        return jsonify({'error': 'El título es obligatorio.'}), 400

    existing = TaskCatalog.query.filter_by(title=title).first()
    if existing:
        return jsonify({'error': 'Ya existe una tarea con este título en el catálogo.'}), 400

    is_restricted_task = any(r_task in title.lower().strip() for r_task in RESTRICTED_COOKING_TASKS)

    new_item = TaskCatalog(
        title=title,
        default_duration=default_duration,
        category=category,
        is_restricted_for_children=is_restricted_task
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify(new_item.to_dict()), 201

@task_bp.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    view_all = request.args.get('all', 'false').lower() == 'true'
    
    if user and (user.role in ['administrator', 'contributor'] or view_all):
        tasks = Task.query.order_by(Task.id.desc()).all()
    else:
        tasks = Task.query.filter_by(assigned_to_id=int(current_user_id)).order_by(Task.id.desc()).all()
        
    return jsonify([task.to_dict() for task in tasks]), 200

@task_bp.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    if current_user and current_user.role not in ['administrator', 'contributor']:
        return jsonify({'error': 'No tiene permisos para crear o asignar tareas.'}), 403

    data = request.get_json() or {}
    title = data.get('title')
    duration = data.get('duration', 30)
    day_assigned = data.get('day_assigned', 'Lunes')
    time_assigned = data.get('time_assigned', '09:00')
    date_assigned = data.get('date_assigned')
    assigned_to_id = data.get('assigned_to_id')

    if not title:
        return jsonify({'error': 'El título de la tarea es obligatorio.'}), 400

    assigned_user = None
    if assigned_to_id:
        assigned_user = User.query.get(int(assigned_to_id))
        if not assigned_user:
            return jsonify({'error': 'El usuario asignado no existe.'}), 404

        # Validate Child Restriction Rule
        is_restricted, error_msg = check_child_restriction(assigned_user, title)
        if is_restricted:
            return jsonify({'error': error_msg}), 400

    is_restricted_task = any(r_task in title.lower().strip() for r_task in RESTRICTED_COOKING_TASKS)

    task = Task(
        title=title,
        duration=duration,
        day_assigned=day_assigned,
        time_assigned=time_assigned,
        date_assigned=date_assigned,
        status='pending',
        is_restricted_for_children=is_restricted_task,
        assigned_to_id=assigned_to_id,
        created_by_id=int(current_user_id)
    )

    db.session.add(task)
    db.session.commit()

    task_data = task.to_dict()
    broadcast_event('task_created', task_data)
    broadcast_event('task_updated', task_data)

    return jsonify(task_data), 201

@task_bp.route('/api/tasks/<int:task_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_task(task_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Tarea no encontrada.'}), 404

    data = request.get_json() or {}

    # Check permission
    is_admin = current_user and current_user.role in ['administrator', 'contributor']
    is_assignee = task.assigned_to_id == int(current_user_id)

    if not is_admin and not is_assignee:
        return jsonify({'error': 'No tiene autorización para modificar esta tarea.'}), 403

    if 'title' in data:
        task.title = data['title']
    if 'duration' in data:
        task.duration = data['duration']
    if 'day_assigned' in data:
        task.day_assigned = data['day_assigned']
    if 'time_assigned' in data:
        task.time_assigned = data['time_assigned']
    if 'date_assigned' in data:
        task.date_assigned = data['date_assigned']
    if 'status' in data:
        task.status = data['status']

    if 'assigned_to_id' in data and is_admin:
        new_assigned_to_id = data['assigned_to_id']
        if new_assigned_to_id:
            assigned_user = User.query.get(int(new_assigned_to_id))
            if assigned_user:
                is_restricted, error_msg = check_child_restriction(assigned_user, task.title)
                if is_restricted:
                    return jsonify({'error': error_msg}), 400
                task.assigned_to_id = new_assigned_to_id
        else:
            task.assigned_to_id = None

    task.is_restricted_for_children = any(r_task in task.title.lower().strip() for r_task in RESTRICTED_COOKING_TASKS)

    db.session.commit()

    task_data = task.to_dict()
    broadcast_event('task_updated', task_data)

    return jsonify(task_data), 200

@task_bp.route('/api/tasks/<int:task_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Tarea no encontrada.'}), 404

    task.status = 'completed' if task.status == 'pending' else 'pending'
    db.session.commit()

    task_data = task.to_dict()
    broadcast_event('task_updated', task_data)

    return jsonify(task_data), 200

@task_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    if current_user and current_user.role not in ['administrator', 'contributor']:
        return jsonify({'error': 'No tiene permisos para eliminar tareas.'}), 403

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Tarea no encontrada.'}), 404

    db.session.delete(task)
    db.session.commit()

    broadcast_event('task_deleted', {'id': task_id})
    return jsonify({'message': 'Tarea eliminada exitosamente.', 'id': task_id}), 200
