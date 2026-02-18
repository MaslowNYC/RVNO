import { supabase } from "@/lib/supabase";
import { EventsContent } from "./EventsContent";

export const revalidate = 60;

async function getEvents() {
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("sort_order", { ascending: true });

  return data || [];
}

export default async function EventsPage() {
  const events = await getEvents();

  return <EventsContent initialEvents={events} />;
}
