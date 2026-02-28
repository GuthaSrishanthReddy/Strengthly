export const toVectorLiteral = (values: number[]): string => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Embedding vector is empty");
  }

  const serialized = values.map((value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      throw new Error("Embedding vector contains non-finite values");
    }
    return n.toFixed(8);
  });

  return `[${serialized.join(",")}]`;
};

