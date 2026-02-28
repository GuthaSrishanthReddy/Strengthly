import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Fitness Tracker</p>
    </footer>
  );
};

export default Footer;
