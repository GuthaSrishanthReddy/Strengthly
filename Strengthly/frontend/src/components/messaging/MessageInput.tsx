import { useState } from "react";
import "./MessageInput.css";

type Props = {
  onSend?: (text: string) => void;
};

const MessageInput = ({ onSend }: Props) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text);
    setText("");
  };

  return (
    <div className="message-input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
