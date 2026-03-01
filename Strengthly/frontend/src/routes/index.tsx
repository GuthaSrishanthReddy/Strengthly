import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import TrainerDashboard from "../pages/trainer/TrainerDashboard";
import UserLayout from "../layouts/UserLayout";
import TrainerLayout from "../layouts/TrainerLayout";

/* Public */
import PublicRoute from "./PublicRoute";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import Diet from "../pages/public/Diet";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";

/* User */
import UpdateProgress from "../pages/user/UpdateProgress";
import Progress from "../pages/user/Progress";
import MyPlan from "../pages/user/MyPlan";
import MyTrainer from "../pages/user/MyTrainer";
import ExploreTrainers from "../pages/user/ExploreTrainers";
import Profile from "../pages/user/Profile";
import UserDataForm from "../pages/user/UserDataForm";
import ChatBotWindow from "../components/chatbot/ChatWindow";
import UserHome from "../pages/user/UserHome";

/* Trainer */
import MyClients from "../pages/trainer/MyClients";
import ExploreClients from "../pages/trainer/ExploreClients";
import ClientDetails from "../pages/trainer/ClientDetails";
import MyHistory from "../pages/trainer/MyHistory";
import TrainerProfile from "../pages/trainer/TrainerProfile";
import TrainerHome from "../pages/trainer/TrainerHome";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌍 Public */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <PublicLayout>
              <Home />
            </PublicLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/diet"
        element={
          <PublicRoute>
            <PublicLayout>
              <Diet />
            </PublicLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <PublicLayout>
              <Login />
            </PublicLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <PublicLayout>
              <Signup />
            </PublicLayout>
          </PublicRoute>
        }
      />

      {/* 👤 USER */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<UserHome />} />
        <Route path="plan" element={<MyPlan />} />
        <Route path="progress" element={<Progress />} />
        <Route path="progress/update" element={<UpdateProgress />} />
        <Route path="my-trainer" element={<MyTrainer />} />
        <Route path="explore-trainers" element={<ExploreTrainers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="user-data" element={<UserDataForm />} />
      </Route>

      <Route
        element={
          <ProtectedRoute role="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/chatBot" element={<ChatBotWindow />} />
      </Route>

      {/* 🧑‍🏫 TRAINER */}
      <Route
        path="/trainer"
        element={
          <ProtectedRoute role="TRAINER">
            <TrainerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<TrainerHome />} />
        <Route path="dashboard" element={<TrainerDashboard />} />
        <Route path="clients" element={<MyClients />} />
        <Route path="explore-clients" element={<ExploreClients />} />
        <Route path="client-details" element={<ClientDetails />} />
        <Route path="history" element={<MyHistory />} />
        <Route path="profile" element={<TrainerProfile />} />
      </Route>

      {/* ❌ 404 */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes >
  );
};

export default AppRoutes;
