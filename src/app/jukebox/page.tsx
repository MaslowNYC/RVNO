import { createClient } from "@/lib/supabase-server";
import { JukeboxContent } from "./JukeboxContent";

export const revalidate = 60;

export const metadata = {
  title: "The Jukebox | Roanoke Valley Norton Owners",
  description: "Every member's favorite song, in one place.",
};

async function getMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("is_crew", true)
    .not("song_title", "is", null)
    .order("sort_order", { ascending: true });
  return data || [];
}

export default async function JukeboxPage() {
  const members = await getMembers();

  return <JukeboxContent initialMembers={members} />;
}
