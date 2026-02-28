import "./Button.css";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
};

const Button = ({ children, onClick, type = "button" }: Props) => {
  return (
    <button className="btn" onClick={onClick} type={type}>
      {children}
    </button>
  );
};

export default Button;
