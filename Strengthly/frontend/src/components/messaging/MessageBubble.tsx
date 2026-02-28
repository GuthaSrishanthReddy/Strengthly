import "./MessageBubble.css";

type Props = {
  text: string;
  sender: "user" | "trainer";
};

const MessageBubble = ({ text, sender }: Props) => {
  return (
    <div className={`message-bubble message-bubble--${sender}`}>
      {text}
    </div>
  );
};

export default MessageBubble;
