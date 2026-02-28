import "./ExploreClients.css";

const dummyClients = [
  {
    id: "1",
    name: "Rahul Sharma",
    goal: "Weight Loss",
    level: "Beginner",
  },
  {
    id: "2",
    name: "Ananya Verma",
    goal: "Muscle Gain",
    level: "Intermediate",
  },
  {
    id: "3",
    name: "Karthik Reddy",
    goal: "Maintenance",
    level: "Advanced",
  },
];

const ExploreClients = () => {
  return (
    <div className="explore-clients">
      <h2>Explore Clients</h2>
      <p>Find users looking for personal training</p>

      <div className="explore-clients__grid">
        {dummyClients.map((client) => (
          <div key={client.id} className="client-card">
            <h3>{client.name}</h3>
            <p><strong>Goal:</strong> {client.goal}</p>
            <p><strong>Level:</strong> {client.level}</p>

            <button className="primary-btn" disabled>
              Accept Client (coming soon)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreClients;
