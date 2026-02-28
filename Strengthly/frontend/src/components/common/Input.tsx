import "./Input.css";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const Input = (props: Props) => {
  return <input className="input" {...props} />;
};

export default Input;
