import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ChatbotFloatingButton from "../components/chatbot/ChatbotFloatingButton";

import "./UserLayout.css";

const UserLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.toLowerCase() === "/chatbot";

  return (
    <div className="user-layout">
      <Navbar />
      <main
        className={`user-layout__content${
          isChatPage ? " user-layout__content--chat" : ""
        }`}
      >
        <Outlet />
      </main>

      {/* Floating AI Chatbot (USER ONLY) */}
      <ChatbotFloatingButton />
    </div>
  );
};

export default UserLayout;
