import { supabase } from "@/lib/supabase";
import { MissionContent } from "./MissionContent";

export const revalidate = 60;

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("body")
    .eq("page_key", "mission_image_caption")
    .single();
  return data?.body || null;
}

export default async function MissionPage() {
  const imageCaption = await getPageContent();

  return <MissionContent imageCaption={imageCaption} />;
}
