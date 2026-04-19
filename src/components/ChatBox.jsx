import { useEffect, useState } from "react";
import {
  connectSocket,
  offReceiveMessage,
  offSlotUpdated,
  onReceiveMessage,
  onSlotUpdated,
  socket
} from "../socket/socket";

export default function ChatBox({ appointmentId = "appointment-demo-101", senderId = "user-demo-1" }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [slotNotice, setSlotNotice] = useState("");

  useEffect(() => {
    connectSocket();

    socket.emit("joinRoom", { appointmentId });

    const handleReceiveMessage = (payload) => {
      const targetRoom = payload.roomId || payload.appointmentId;
      if (targetRoom && String(targetRoom) !== String(appointmentId)) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: payload._id || `${Date.now()}-${Math.random()}`,
          sender: payload.senderId === senderId ? "You" : payload.senderId || "User",
          text: payload.text || payload.message || "",
          createdAt: payload.createdAt || payload.timestamp || new Date().toISOString()
        }
      ]);
    };

    const handleSlotUpdated = (payload) => {
      setSlotNotice(`Slots updated for ${payload?.date || "selected date"}`);
    };

    onReceiveMessage(handleReceiveMessage);
    onSlotUpdated(handleSlotUpdated);

    return () => {
      offReceiveMessage(handleReceiveMessage);
      offSlotUpdated(handleSlotUpdated);
    };
  }, [appointmentId, senderId]);

  const sendMessage = (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    socket.emit("sendMessage", {
      appointmentId,
      message: text,
      senderId
    });

    setInput("");
  };

  return (
    <section className="rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">💬 Doctor Chat</h1>
            <p className="text-blue-100 text-sm mt-1">Consultation Room • {appointmentId}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Dr. Hamza Khan • Online</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {slotNotice && (
        <div className="mx-4 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          {slotNotice}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Start a conversation with your doctor</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === "You";
          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm ${
                isUser
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
              }`}>
                <p className="text-sm font-semibold mb-1 opacity-75 text-xs">{msg.sender}</p>
                <p className="text-sm break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  isUser ? "text-blue-100" : "text-gray-500"
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing Indicator */}
      <div className="px-6 py-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          <span className="ml-2">Doctor is typing...</span>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2 items-end">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or medical concerns..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" /></svg>
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
