import { supabase } from "@/lib/supabase";
import { HomeContent } from "./HomeContent";

export const revalidate = 60;

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("body")
    .eq("page_key", "home_hero_caption")
    .single();
  return data?.body || null;
}

export default async function Home() {
  const heroCaption = await getPageContent();

  return <HomeContent heroCaption={heroCaption} />;
}
