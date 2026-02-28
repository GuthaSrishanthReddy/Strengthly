import MessageBubble from "./MessageBubble";
import "./MessageThread.css";

const MessageThread = () => {
  // placeholder messages
  const messages = [
    { id: 1, text: "Hi trainer!", sender: "user" as const },
    { id: 2, text: "Hello! How can I help?", sender: "trainer" as const },
  ];

  return (
    <div className="message-thread">
      {messages.map(m => (
        <MessageBubble
          key={m.id}
          text={m.text}
          sender={m.sender}
        />
      ))}
    </div>
  );
};

export default MessageThread;
