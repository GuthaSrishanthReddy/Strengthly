import ReactMarkdown from "react-markdown";
import "./ChatMessage.css";

type ChatMessageProps = {
  text: string;
  variant?: "bot" | "user";
};

export default function ChatMessage({ text, variant = "bot" }: ChatMessageProps) {
  return (
    <div className={`chat-message chat-message--${variant}`}>
      <span className="chat-message__bubble">
        {variant === "bot" ? (
          <ReactMarkdown>{text}</ReactMarkdown>
        ) : (
          text
        )}
      </span>
    </div>
  );
}
