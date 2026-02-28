import { useEffect, useState } from "react";
import TrainerCard from "../../components/cards/TrainerCard";
import { fetchTrainers } from "../../services/trainer.service";
import type { TrainerListItem } from "../../types/trainer.types";
import "./ExploreTrainers.css";

const ExploreTrainers = () => {
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchTrainers();
        if (active) setTrainers(data);
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load trainers");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="explore-trainers">
      <h2>Explore Trainers</h2>

      <div className="explore-trainers__list">
        {loading && <p>Loading trainers...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && trainers.length === 0 && (
          <p>No trainers found.</p>
        )}
        {!loading &&
          !error &&
          trainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              name={trainer.user.name}
              expertise={trainer.expertise.join(", ")}
            />
          ))}
      </div>
    </div>
  );
};

export default ExploreTrainers;
