import { useCallback, useEffect, useRef, useState } from "react";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { askChatbot, endChatSession } from "../../services/chatbot.service";
import "./ChatWindow.css";

type ChatWindowProps = {
  onClose?: () => void;
};

export default function ChatWindow({ onClose }: ChatWindowProps) {

  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const endedRef = useRef(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; sender: "user" | "ai"; text: string }[]
  >([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! Ask me anything about training or nutrition.",
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const endSession = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    try {
      await endChatSession(sessionIdRef.current);
    } catch {
      // ignore end-session errors
    }
  }, []);

  const handleClose = useCallback(() => {
    void endSession();
    onClose?.();
  }, [onClose, endSession]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const reply = await askChatbot(sessionIdRef.current, trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "ai",
          text: error?.message || "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys if the user is typing in an input
      const tagName = document.activeElement?.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") {
        return;
      }

      if (event.key === "Escape") {
        handleClose();
      }
      if (event.key === "f" || event.key === "F") {
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      void endSession();
    };
  }, [handleClose, endSession]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className={`chat-window${isFullscreen ? " chat-window--fullscreen" : ""}`}>
      <header className="chat-window__header">
        <div>
          <p className="chat-window__title">AI Coach</p>
          <p className="chat-window__subtitle">Fitness guidance on demand</p>
        </div>
        <div className="chat-window__header-actions">
          <button
            type="button"
            className="chat-window__close"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => setIsFullscreen((prev) => !prev)}
          >
            {isFullscreen ? "Exit" : "Full"}

          </button>
          <button
            type="button"
            className="chat-window__close"
            aria-label="Close chat"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </header>

      <div className="chat-window__messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            text={message.text}
            variant={message.sender === "user" ? "user" : "bot"}
          />
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-window__composer">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isSending}
        />
      </div>
    </div>
  );
}
