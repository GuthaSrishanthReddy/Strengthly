import { createContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

export const ThemeContext = createContext({
  theme: "dark" as Theme,
  toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme, toggleTheme: () =>
          setTheme(t => (t === "light" ? "dark" : "light"))
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
