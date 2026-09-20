import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://gestor-de-tareas-del-hogar.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

export const initSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const subscribeToTaskEvents = (onTaskCreated, onTaskUpdated, onTaskDeleted) => {
  initSocket();

  if (onTaskCreated) socket.on('task_created', onTaskCreated);
  if (onTaskUpdated) socket.on('task_updated', onTaskUpdated);
  if (onTaskDeleted) socket.on('task_deleted', onTaskDeleted);

  return () => {
    if (onTaskCreated) socket.off('task_created', onTaskCreated);
    if (onTaskUpdated) socket.off('task_updated', onTaskUpdated);
    if (onTaskDeleted) socket.off('task_deleted', onTaskDeleted);
  };
};

export const subscribeToScheduleEvents = (onScheduleUpdated, onScheduleDeleted) => {
  initSocket();

  if (onScheduleUpdated) socket.on('schedule_updated', onScheduleUpdated);
  if (onScheduleDeleted) socket.on('schedule_deleted', onScheduleDeleted);

  return () => {
    if (onScheduleUpdated) socket.off('schedule_updated', onScheduleUpdated);
    if (onScheduleDeleted) socket.off('schedule_deleted', onScheduleDeleted);
  };
};