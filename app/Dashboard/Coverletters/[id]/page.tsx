import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorScreen from "./screen";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    redirect("/auth/login");
  }
  const user = userRes.user;

  const { data: row, error } = await supabase
    .from("cover_letters")
    .select("id, title, company, content, created_at, user_id, meta")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    notFound();
  }

  const title = row.title || (row.company ? `${row.company} — Cover Letter` : "Cover Letter");
  const body = row.content || "";
  const meta = (row as any).meta ?? undefined;

  return (
    <EditorScreen
      letterId={row.id}
      initialTitle={title}
      initialBody={body}
      initialMeta={meta}
    />
  );
}
