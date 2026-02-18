import { supabase } from "@/lib/supabase";
import { AboutContent } from "./AboutContent";
import type { PageContent } from "@/lib/database.types";

export const revalidate = 60;

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("*")
    .in("page_key", ["about_intro", "about_values", "about_blue_ridge", "about_inoa"]);

  const contentMap: Record<string, PageContent> = {};
  if (data) {
    for (const item of data) {
      contentMap[item.page_key] = item;
    }
  }
  return contentMap;
}

export default async function AboutPage() {
  const content = await getPageContent();

  return (
    <AboutContent
      introContent={content["about_intro"] || null}
      valuesContent={content["about_values"] || null}
      blueRidgeContent={content["about_blue_ridge"] || null}
      inoaContent={content["about_inoa"] || null}
    />
  );
}
