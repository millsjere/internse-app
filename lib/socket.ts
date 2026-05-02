import io, { Socket } from 'socket.io-client';
import { useNotificationStore } from './store';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Socket.io connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  socket.on('notification', (data) => {
    const store = useNotificationStore.getState();
    store.addNotification(data);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket || initializeSocket();
};

export const joinAsUser = (userId: string, email: string) => {
  const sock = getSocket();
  if (sock) {
    sock.emit('user_join', { _id: userId, email, type: 'user' });
  }
};

export const joinAsCompany = (companyId: string, email: string) => {
  const sock = getSocket();
  if (sock) {
    sock.emit('company_join', { _id: companyId, email, type: 'company' });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
