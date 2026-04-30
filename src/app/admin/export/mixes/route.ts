import { buildCsv, csvResponse } from "@/lib/admin/csv";
import { requireAdminServiceRoleClient } from "@/lib/admin/require-admin";
import type { TableRow } from "@/types/database";

type MixRow = TableRow<"dj_mixes">;

const MIX_COLUMNS: readonly (keyof MixRow)[] = [
  "id",
  "dj_name",
  "email",
  "city",
  "instagram",
  "mix_title",
  "mix_link",
  "platform",
  "notes",
  "status",
  "created_at",
];

export async function GET() {
  try {
    const supabase = await requireAdminServiceRoleClient();
    const { data, error } = await supabase
      .from("dj_mixes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    const csv = buildCsv((data ?? []) as MixRow[], MIX_COLUMNS);
    return csvResponse("dj_mixes.csv", csv);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
