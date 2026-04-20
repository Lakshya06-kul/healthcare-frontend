import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"]
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const onSlotUpdated = (callback) => {
  socket.on("slotUpdated", callback);
};

export const offSlotUpdated = (callback) => {
  socket.off("slotUpdated", callback);
};

export const onSlotBooked = (callback) => {
  socket.on("slotBooked", callback);
};

export const offSlotBooked = (callback) => {
  socket.off("slotBooked", callback);
};

export const onReceiveMessage = (callback) => {
  socket.on("receiveMessage", callback);
};

export const offReceiveMessage = (callback) => {
  socket.off("receiveMessage", callback);
};
