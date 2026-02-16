import { supabase } from "@/lib/supabase";

export const revalidate = 60;

async function getMembers() {
  const { data } = await supabase
    .from("members")
    .select("*")
    .order("sort_order", { ascending: true });
  return data || [];
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          The Usual Suspects
        </h1>
        <p className="font-body text-sm text-rvno-ink-muted italic">
          The people behind the Nortons
        </p>
      </header>

      {members.length === 0 ? (
        <p className="text-center font-mono text-sm text-rvno-ink-dim">
          Member profiles coming soon. We&apos;re still finding our good sides.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-rvno-card rounded-lg border border-white/[0.06] p-5 flex gap-4 items-start"
            >
              {/* Photo or placeholder */}
              <div className="w-16 h-16 rounded-full bg-rvno-surface flex-shrink-0 flex items-center justify-center overflow-hidden">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-lg text-rvno-ink-dim">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base font-semibold text-rvno-ink">
                  {member.name}
                </h3>
                {member.title && (
                  <p className="font-mono text-[10px] text-rvno-teal tracking-wide uppercase mt-0.5">
                    {member.title}
                  </p>
                )}
                {member.bio && (
                  <p className="font-body text-xs text-rvno-ink-muted mt-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}
                {member.bikes && (
                  <p className="font-mono text-[10px] text-rvno-ink-dim mt-2">
                    🏍️ {member.bikes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
