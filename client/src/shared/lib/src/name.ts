export function getInitials(firstName: string, lastName: string) {
  const firstInitial = firstName.trim().charAt(0);
  const lastInitial = lastName.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

export function getFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}
