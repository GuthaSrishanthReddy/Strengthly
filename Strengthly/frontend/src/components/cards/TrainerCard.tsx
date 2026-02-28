import "./TrainerCard.css";

type Props = {
  name: string;
  expertise: string;
};

const TrainerCard = ({ name, expertise="" }: Props) => {
  return (
    <div className="trainer-card">
      <h4>{name}</h4>
      <p>{expertise}</p>
    </div>
  );
};

export default TrainerCard;
