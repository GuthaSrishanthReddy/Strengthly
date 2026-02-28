import "./SplitText.css";

type SplitTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

const SplitText = ({ text, className = "", as = "h2" }: SplitTextProps) => {
  const Tag = as;

  return (
    <Tag className={`split-text ${className}`.trim()} aria-label={text}>
      {Array.from(text).map((char, idx) => (
        <span
          key={`${char}-${idx}`}
          className="split-text__char"
          style={{ animationDelay: `${idx * 35}ms` }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;
