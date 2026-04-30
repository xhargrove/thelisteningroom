import { buildCsv, csvResponse } from "@/lib/admin/csv";
import { requireAdminSupabase } from "@/lib/admin/require-admin";
import type { TableRow } from "@/types/database";

type EmailRow = TableRow<"emails">;

const EMAIL_COLUMNS: readonly (keyof EmailRow)[] = [
  "id",
  "name",
  "email",
  "role",
  "created_at",
];

export async function GET() {
  try {
    const supabase = await requireAdminSupabase();
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    const csv = buildCsv((data ?? []) as EmailRow[], EMAIL_COLUMNS);
    return csvResponse("emails.csv", csv);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
