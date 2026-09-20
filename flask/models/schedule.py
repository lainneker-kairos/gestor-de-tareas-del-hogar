from database import db
from datetime import datetime

class Schedule(db.Model):
    __tablename__ = 'schedules'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day_of_week = db.Column(db.String(50), nullable=False, default='Lunes')
    start_time = db.Column(db.String(20), default='08:00')
    end_time = db.Column(db.String(20), default='17:00')
    note = db.Column(db.String(255), nullable=True)
    file_url = db.Column(db.String(255), nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'note': self.note,
            'file_url': self.file_url,
            'file_name': self.file_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
