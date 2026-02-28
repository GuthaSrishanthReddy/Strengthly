import RecentProgress from "../../components/progress/RecentProgress";
import "./Profile.css";

const Profile = () => {
  return (
    <div className="user-profile">
      <h2>My Profile</h2>
      <RecentProgress title="present condition" />
      <button className="user-profile__btn">Reset Password</button>
    </div>
  );
};

export default Profile;
