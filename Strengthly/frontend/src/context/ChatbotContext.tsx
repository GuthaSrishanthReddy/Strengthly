import { createContext, useState } from "react";
import type { ChatMessage } from "../types/chat.types";

type ChatbotContextType = {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
};

export const ChatbotContext = createContext<ChatbotContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},

  messages: [],
  addMessage: () => {},
  clearMessages: () => {},
});

export const ChatbotProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! I’m your fitness assistant. Ask me anything 👋",
    },
  ]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((v) => !v);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        addMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
