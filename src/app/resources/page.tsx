import { supabase } from "@/lib/supabase";
import { ResourcesContent } from "./ResourcesContent";

export const revalidate = 60;

async function getResources() {
  const { data } = await supabase
    .from("resources")
    .select("*")
    .order("sort_order", { ascending: true });

  return data || [];
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return <ResourcesContent initialResources={resources} />;
}
