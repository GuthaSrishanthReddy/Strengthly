import SplitText from "../../components/reactbits/SplitText";
import "./UserHome.css";

const highlights = [
  {
    title: "Personalized Weekly Plan",
    body: "From a user perspective, this app converts your goals and updates into a practical day-wise routine you can follow without guesswork.",
  },
  {
    title: "Progress Intelligence",
    body: "You log metrics in one place and the platform builds continuity across weeks so every update contributes to better recommendations.",
  },
  {
    title: "Guidance + Accountability",
    body: "The experience combines self-tracking with trainer visibility, so support is aligned to your real activity and not assumptions.",
  },
  {
    title: "Simple Execution Loop",
    body: "Plan, track, review, and adjust. The product is built as a repeatable loop that helps users stay consistent over time.",
  },
  {
    title: "On-Demand AI Support",
    body: "You can ask for quick workout or nutrition guidance inside the same workspace while following your regular routine.",
  },
  {
    title: "One Workspace",
    body: "Instead of navigating many disconnected tools, users get a unified fitness workflow designed for clarity and momentum.",
  },
];

const UserHome = () => {
  return (
    <div className="role-home role-home--user">
      <section className="role-home__slide role-home__slide--hero">
        <p className="role-home__eyebrow">User Home</p>
        <SplitText
          as="h2"
          className="role-home__split-title"
          text="Your fitness workspace in one flow"
        />
        <p>
          Strengthly combines planning, progress tracking, trainer support, and
          AI guidance so you can move from goal to execution without jumping
          across tools.
        </p>
      </section>

      <section className="role-home__slides" aria-label="Application features">
        {highlights.map((item, idx) => (
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

export default UserHome;
