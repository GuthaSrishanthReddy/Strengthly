import SplitText from "../../components/reactbits/SplitText";
import "./TrainerHome.css";

const trainerSections = [
  {
    title: "Central Coaching Console",
    body: "From a trainer perspective, the application acts like a command center where client direction, progress context, and follow-up actions stay connected.",
  },
  {
    title: "Context-Rich Client View",
    body: "You work with current client information rather than isolated check-ins, which supports more accurate coaching decisions.",
  },
  {
    title: "Structured Workflow",
    body: "The platform supports a repeatable sequence: assess, guide, review progress, and refine strategy for each client cycle.",
  },
  {
    title: "Scalable Practice",
    body: "With standardized flows and organized records, trainers can handle multiple clients without losing quality or consistency.",
  },
  {
    title: "Communication Clarity",
    body: "Recommendations are easier to align when both coach and client are using the same plan and progress baseline.",
  },
  {
    title: "Efficiency with Insight",
    body: "The app reduces context switching so trainers can spend more time on high-quality guidance instead of administrative friction.",
  },
];

const TrainerHome = () => {
  return (
    <div className="role-home role-home--trainer">
      <section className="role-home__slide role-home__slide--hero">
        <p className="role-home__eyebrow">Trainer Home</p>
        <SplitText
          as="h2"
          className="role-home__split-title"
          text="Manage coaching from one place"
        />
        <p>
          Strengthly helps trainers run efficient client workflows with clear
          visibility into plans, updates, and follow-up actions.
        </p>
      </section>

      <section className="role-home__slides" aria-label="Application features">
        {trainerSections.map((item, idx) => (
          <article
            key={item.title}
            className="role-home__slide"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <SplitText as="h3" className="role-home__card-title" text={item.title} />
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default TrainerHome;
