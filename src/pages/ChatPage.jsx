import ChatBox from "../components/ChatBox";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <ChatBox appointmentId="appointment-demo-101" senderId="user-demo-1" />
    </div>
  );
}
