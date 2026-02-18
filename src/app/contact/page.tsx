import { supabase } from "@/lib/supabase";
import { ContactContent } from "./ContactContent";

export const revalidate = 60;

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("*")
    .eq("page_key", "contact_joining")
    .single();

  return data;
}

export default async function ContactPage() {
  const joiningContent = await getPageContent();

  return <ContactContent joiningContent={joiningContent} />;
}
