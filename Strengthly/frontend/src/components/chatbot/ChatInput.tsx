import "./ChatInput.css";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatInputProps) {
  return (
    <form
      className="chat-input"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <input
        className="chat-input__field"
        placeholder="Ask your AI coach..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <button className="chat-input__button" type="submit" disabled={disabled}>
        {disabled ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
