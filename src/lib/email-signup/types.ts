export type EmailSignupState = {
  success: boolean;
  error: string | null;
  fieldErrors: Partial<Record<"name" | "email" | "role", string>>;
};
