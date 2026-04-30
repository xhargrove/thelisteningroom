export type MixSubmitState = {
  success: boolean;
  error: string | null;
  fieldErrors: Partial<
    Record<
      "dj_name" | "email" | "mix_title" | "mix_link" | "city" | "instagram" | "platform" | "notes",
      string
    >
  >;
};
