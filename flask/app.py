import os
import re
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db
from extention_sockets import socketio

# Import Models
from models.user import User
from models.task import TaskCatalog, Task
from models.schedule import Schedule
from models.settings import Settings

# Import Routes
from routes.auth_routes import auth_bp
from routes.task_routes import task_bp
from routes.schedule_routes import schedule_bp
from routes.settings_routes import settings_bp

def create_app():
    app = Flask(__name__)

    # Configuración de llaves secretas
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'distribucion-tareas-super-secret-key-2026')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-distribucion-tareas')
    
    # Base de datos (PostgreSQL en Render o SQLite local)
    db_url = os.environ.get('DATABASE_URL', 'sqlite:///distribucion_tareas.db')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicialización de extensiones
    db.init_app(app)
    JWTManager(app)

    # CORS para admitir dominios de producción y previews de Vercel
    allowed_origins = [
        r"^https://.*\.vercel\.app$",
        r"^http://localhost:3000$"
    ]
    frontend_custom_url = os.environ.get('FRONTEND_URL')
    if frontend_custom_url:
        allowed_origins.append(frontend_custom_url)

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    socketio.init_app(app, cors_allowed_origins="*")

    # Registro de Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(settings_bp)

    @app.route('/')
    def root():
        return jsonify({
            'name': 'API Distribución de Tareas del Hogar',
            'status': 'online',
            'version': '1.0.0'
        }), 200

    # Inicializar tablas y datos iniciales
    with app.app_context():
        db.create_all()
        seed_initial_data()

    return app

def seed_initial_data():
    if User.query.count() == 0:
        lainneker = User(username='Lainneker', email='lainneker@casa.com', role='administrator', is_child=False)
        lainneker.set_password('Admin.123')

        anyeline = User(username='Anyeline', email='anyeline@casa.com', role='administrator', is_child=False)
        anyeline.set_password('Admin.123')

        gabriela = User(username='Gabriela', email='gabriela@casa.com', role='member', is_child=True)
        gabriela.set_password('Admin.123')

        db.session.add_all([lainneker, anyeline, gabriela])
        db.session.commit()
        print("Seeded default users: Lainneker, Anyeline, Gabriela")

    if TaskCatalog.query.count() == 0:
        catalog_seed = [
            {"title": "Barrer y fregar el suelo", "default_duration": 40, "is_restricted": False, "category": "Limpieza"},
            {"title": "Lavar el baño", "default_duration": 60, "is_restricted": False, "category": "Limpieza"},
            {"title": "Limpiar la nevera", "default_duration": 30, "is_restricted": False, "category": "Cocina"},
            {"title": "Asear mi habitación", "default_duration": 20, "is_restricted": False, "category": "Dormitorio"},
            {"title": "Limpiar cristales", "default_duration": 30, "is_restricted": False, "category": "Limpieza"},
            {"title": "Lavar la ropa", "default_duration": 90, "is_restricted": False, "category": "Ropa"},
            {"title": "Pasar trapo con alcohol", "default_duration": 20, "is_restricted": False, "category": "Desinfección"},
            {"title": "Limpiar la cocina", "default_duration": 40, "is_restricted": False, "category": "Cocina"},
            {"title": "Regar las plantas", "default_duration": 10, "is_restricted": False, "category": "Jardín"},
            {"title": "Llenar jarras de Agua", "default_duration": 15, "is_restricted": False, "category": "Cocina"},
            {"title": "Ordenar la ropa", "default_duration": 20, "is_restricted": False, "category": "Ropa"},
            {"title": "Preparar desayuno", "default_duration": 40, "is_restricted": True, "category": "Cocina"},
            {"title": "Preparar almuerzo", "default_duration": 60, "is_restricted": True, "category": "Cocina"},
            {"title": "Preparar cena", "default_duration": 40, "is_restricted": True, "category": "Cocina"},
            {"title": "Preparar snack", "default_duration": 20, "is_restricted": False, "category": "Cocina"},
            {"title": "Lavar uniforme", "default_duration": 30, "is_restricted": False, "category": "Ropa"}
        ]

        for item in catalog_seed:
            task_cat = TaskCatalog(
                title=item["title"],
                default_duration=item["default_duration"],
                is_restricted_for_children=item["is_restricted"],
                category=item["category"]
            )
            db.session.add(task_cat)
        
        db.session.commit()
        print("Seeded default task catalog with 16 tasks.")

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, debug=True, host='0.0.0.0', port=port)