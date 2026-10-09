import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export function joinClassroom(roomCode) {
  socket.emit('join_room', { room_code: roomCode });
}

export function leaveClassroom(roomCode) {
  socket.emit('leave_room', { room_code: roomCode });
}
