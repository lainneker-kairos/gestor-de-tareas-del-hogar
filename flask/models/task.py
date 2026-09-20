from database import db
from datetime import datetime

class TaskCatalog(db.Model):
    __tablename__ = 'task_catalog'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), unique=True, nullable=False)
    default_duration = db.Column(db.Integer, default=30)  # minutes
    is_restricted_for_children = db.Column(db.Boolean, default=False)
    category = db.Column(db.String(50), default='Hogar')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'default_duration': self.default_duration,
            'is_restricted_for_children': self.is_restricted_for_children,
            'category': self.category
        }

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    duration = db.Column(db.Integer, default=30)  # minutes
    day_assigned = db.Column(db.String(50), default='Lunes')  # Lunes, Martes, Miercoles...
    time_assigned = db.Column(db.String(50), default='09:00')
    date_assigned = db.Column(db.String(20), nullable=True) # e.g. YYYY-MM-DD
    status = db.Column(db.String(50), default='pending')  # 'pending', 'completed'
    is_restricted_for_children = db.Column(db.Boolean, default=False)
    
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'duration': self.duration,
            'day_assigned': self.day_assigned,
            'time_assigned': self.time_assigned,
            'date_assigned': self.date_assigned,
            'status': self.status,
            'is_restricted_for_children': self.is_restricted_for_children,
            'assigned_to_id': self.assigned_to_id,
            'assigned_to_username': self.assigned_user.username if self.assigned_user else None,
            'created_by_id': self.created_by_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
