import "./ClientCard.css";

type Props = {
  name: string;
};

const ClientCard = ({ name }: Props) => {
  return (
    <div className="client-card">
      <h4>{name}</h4>
    </div>
  );
};

export default ClientCard;
