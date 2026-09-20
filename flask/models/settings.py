from database import db

class Settings(db.Model):
    __tablename__ = 'settings'

    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.String(500), nullable=True)

    def __init__(self, key=None, value=None, **kwargs):
        super().__init__(**kwargs)
        if key is not None:
            self.key = key
        if value is not None:
            self.value = value

    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value
        }
