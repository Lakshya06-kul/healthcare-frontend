import { io } from "socket.io-client";

const getSocketURL = () => {
  // First priority: explicit VITE_SOCKET_URL
  if (import.meta.env.VITE_SOCKET_URL) {
    const url = import.meta.env.VITE_SOCKET_URL.trim();
    console.log("[Socket] Using VITE_SOCKET_URL:", url);
    return url;
  }

  // Second priority: derive from VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL.trim();
    try {
      // Extract origin from API URL (e.g., "https://api.example.com/api" -> "https://api.example.com")
      const urlObj = new URL(apiUrl, window.location.origin);
      const origin = urlObj.origin;
      console.log("[Socket] Derived from VITE_API_URL:", origin);
      return origin;
    } catch (e) {
      console.warn("[Socket] Could not parse VITE_API_URL:", apiUrl, e);
    }
  }

  // Fallback: window.location.origin (only safe for dev/same-origin)
  console.log("[Socket] Using window.location.origin:", window.location.origin);
  return window.location.origin;
};

const SOCKET_URL = getSocketURL();

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Socket error handlers
socket.on("connect_error", (error) => {
  console.error("[Socket] Connection error:", error?.message || error);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Disconnected:", reason);
});

socket.on("error", (error) => {
  console.error("[Socket] Error event:", error);
});

export const connectSocket = () => {
  if (!socket.connected) {
    console.log("[Socket] Connecting to:", SOCKET_URL);
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
