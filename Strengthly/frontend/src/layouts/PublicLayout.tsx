import type { ReactNode } from "react";
import Navbar from "../components/common/Navbar";
import "./PublicLayout.css";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-layout__content">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
