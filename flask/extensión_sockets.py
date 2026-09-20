from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")

def broadcast_event(event_name, data):
    """
    Utility function to broadcast real-time updates to all connected clients.
    """
    socketio.emit(event_name, data)
