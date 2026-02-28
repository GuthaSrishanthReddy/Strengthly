import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

import "./TrainerLayout.css";

const TrainerLayout = () => {
  return (
    <div className="trainer-layout">
      <Navbar />
      <main className="trainer-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default TrainerLayout;
