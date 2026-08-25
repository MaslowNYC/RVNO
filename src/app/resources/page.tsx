import { createClient } from "@/lib/supabase-server";
import { ResourcesContent } from "./ResourcesContent";

export const revalidate = 60;

async function getResources() {
  const supabase = await createClient();
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
