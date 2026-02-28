import "./ChatbotFloatingButton.css";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ChatWindow from "./ChatWindow";

export default function ChatbotFloatingButton() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  // Hide AI while auth state loads or for non-users.
  if (isLoading || !user || user.role !== "USER") return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chatbot-btn"
          aria-label="Open AI chat"
          onClick={() => setOpen(true)}
        >
          <span className="chatbot-btn__inner">AI</span>
        </button>
      )}

      {open && (
        <div className="chatbot-float__window" role="dialog" aria-modal="false">
          <ChatWindow onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
