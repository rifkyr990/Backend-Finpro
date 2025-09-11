export function generateReferralCode(first_name: string) {
  return (
    first_name.replace(/\s/g, "").slice(0, 4) +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}
