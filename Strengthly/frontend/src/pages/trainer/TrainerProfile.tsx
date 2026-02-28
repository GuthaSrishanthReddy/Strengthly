import { useState } from "react";
import { updateTrainerProfile } from "../../services/trainer.service";
import "./TrainerProfile.css";

const TrainerProfile = () => {
  const [expertise, setExpertise] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const list = expertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await updateTrainerProfile(list);
      setMessage("Updated successfully.");
    } catch (err: any) {
      setMessage(err.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="trainer-profile">
      <h2>Trainer Profile</h2>

      <form className="trainer-profile__form" onSubmit={handleSubmit}>
        <label className="trainer-profile__field">
          <span>Expertise</span>
          <input
            type="text"
            placeholder="e.g., Strength Training, Nutrition Coaching"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
        </label>

        {message && <p className="trainer-profile__message">{message}</p>}

        <div className="trainer-profile__actions">
          <button
            type="submit"
            className="trainer-profile__btn trainer-profile__btn--primary"
            disabled={isSaving}
          >
            {isSaving ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainerProfile;
