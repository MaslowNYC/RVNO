import { supabase } from "@/lib/supabase";
import { MembersContent } from "./MembersContent";

export const revalidate = 60;

async function getMembers() {
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("is_crew", true)
    .order("name", { ascending: true });
  return data || [];
}

export default async function MembersPage() {
  const members = await getMembers();

  return <MembersContent initialMembers={members} />;
}
