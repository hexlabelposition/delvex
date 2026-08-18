export function formatDate(value: string | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

