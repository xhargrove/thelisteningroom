"use server";

import { EMAIL_ROLE_OPTIONS, type EmailRole } from "@/lib/email-signup/roles";
import type { EmailSignupState } from "@/lib/email-signup/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableInsert } from "@/types/database";

const initialState: EmailSignupState = {
  success: false,
  error: null,
  fieldErrors: {},
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidRole(value: string): value is EmailRole {
  return (EMAIL_ROLE_OPTIONS as readonly string[]).includes(value);
}

export async function subscribeEmail(
  _prev: EmailSignupState,
  formData: FormData,
): Promise<EmailSignupState> {
  const nameRaw = formData.get("name");
  const emailRaw = formData.get("email");
  const roleRaw = formData.get("role");

  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  const emailInput = typeof emailRaw === "string" ? emailRaw.trim() : "";
  const email = emailInput.toLowerCase();
  const role = typeof roleRaw === "string" ? roleRaw.trim() : "";

  const fieldErrors: EmailSignupState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "Name is required.";
  } else if (name.length > 200) {
    fieldErrors.name = "Name must be 200 characters or fewer.";
  }

  if (!emailInput) {
    fieldErrors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!role) {
    fieldErrors.role = "Choose a role.";
  } else if (!isValidRole(role)) {
    fieldErrors.role = "Choose a valid role.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: null, fieldErrors };
  }

  const supabase = await createSupabaseServerClient();

  const row: TableInsert<"emails"> = {
    name,
    email,
    role,
  };

  const { error } = await supabase.from("emails").insert(row);

  if (error) {
    const duplicate =
      error.code === "23505" ||
      /duplicate key|unique constraint/i.test(error.message ?? "");

    if (duplicate) {
      return {
        success: false,
        error: "That email is already on the list.",
        fieldErrors: {},
      };
    }
    return {
      success: false,
      error: error.message || "Something went wrong. Try again.",
      fieldErrors: {},
    };
  }

  return { ...initialState, success: true };
}
