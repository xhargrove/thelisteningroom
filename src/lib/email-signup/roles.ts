export const EMAIL_ROLE_OPTIONS = [
  "Fan",
  "DJ",
  "Artist",
  "Music Pro",
  "Sponsor",
] as const;

export type EmailRole = (typeof EMAIL_ROLE_OPTIONS)[number];
