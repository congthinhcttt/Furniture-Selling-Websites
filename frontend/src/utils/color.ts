function normalizeColorName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getColorSwatch(value?: string) {
  const normalized = normalizeColorName(value || "");

  if (!normalized) {
    return { backgroundColor: "#c6a482", borderColor: "#b08f6d" };
  }

  if (normalized.includes("trang")) {
    return { backgroundColor: "#f5f2eb", borderColor: "#cfc6b8" };
  }

  if (normalized.includes("den")) {
    return { backgroundColor: "#222222", borderColor: "#111111" };
  }

  if (normalized.includes("xam") || normalized.includes("ghi")) {
    return { backgroundColor: "#8e949b", borderColor: "#6d7379" };
  }

  if (normalized.includes("nau") || normalized.includes("go") || normalized.includes("oc cho")) {
    return { backgroundColor: "#7b573f", borderColor: "#5f422f" };
  }

  if (normalized.includes("be") || normalized.includes("kem")) {
    return { backgroundColor: "#dcc9ad", borderColor: "#c0a98a" };
  }

  if (normalized.includes("vang")) {
    return { backgroundColor: "#d6ab52", borderColor: "#b2852e" };
  }

  if (normalized.includes("xanh reu")) {
    return { backgroundColor: "#5f6f52", borderColor: "#4b5840" };
  }

  if (normalized.includes("xanh")) {
    return { backgroundColor: "#6f8fa6", borderColor: "#557287" };
  }

  if (normalized.includes("do")) {
    return { backgroundColor: "#a54a4a", borderColor: "#833737" };
  }

  if (normalized.includes("hong")) {
    return { backgroundColor: "#d59aa4", borderColor: "#bf7d89" };
  }

  if (normalized.includes("dong")) {
    return { backgroundColor: "#b87333", borderColor: "#965d25" };
  }

  return { backgroundColor: "#c6a482", borderColor: "#b08f6d" };
}
