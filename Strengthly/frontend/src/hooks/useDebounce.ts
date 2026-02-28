import { useEffect, useState } from "react";

export function useDebounce<T>(v: T, d = 300) {
  const [val, setVal] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setVal(v), d);
    return () => clearTimeout(id);
  }, [v, d]);
  return val;
}
