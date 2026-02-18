"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { EditableSection } from "@/components/EditableSection";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { PageContent } from "@/lib/database.types";

interface AboutContentProps {
  introContent: PageContent | null;
  valuesContent: PageContent | null;
  blueRidgeContent: PageContent | null;
  inoaContent: PageContent | null;
}

const DEFAULT_INTRO = `When Dave Youngblood moved to Roanoke, Virginia in 1980 with his 750 Commando, he also brought along his passion for Norton motorcycles. In a desire to welcome like-minded people, he formed Roanoke British Iron in 1988. This was the initial chapter name in the International Norton Owner's Association (INOA).

Seven years later, Dave introduced Nortons to his veterinarian, Mark Finkler, who previously had only owned Japanese motorcycles. Dave contacted his good friend in Colorado, Todd Blevins, to see if he knew of any decent motorcycles for sale. Todd found a 73' 750 Commando and arranged to have it shipped to Roanoke. This became Mark's first and only Norton. Mark was hooked!

Years later, they decided to change the name to be more brand-specific: the Roanoke Valley Norton Owners.`;

const DEFAULT_VALUES = JSON.stringify({
  items: [
    {
      title: "Riding",
      text: "Because these bikes were meant to be ridden, not just admired. We organize regular rides through some of the best motorcycling country in America.",
    },
    {
      title: "Friendship",
      text: "The camaraderie that comes from sharing a passion for machines that require equal parts mechanical skill and blind optimism.",
    },
    {
      title: "Keeping Nortons Alive",
      text: "Through shared knowledge, spare parts, and the occasional emergency roadside repair, we help each other keep these classic bikes on the road.",
    },
  ],
  closing:
    "We're a laid-back group that welcomes anyone with an appreciation for Norton motorcycles — whether you own one, used to own one, or just think they're pretty neat. No membership dues, no complicated rules, just good people who enjoy British bikes and good roads.",
});

const DEFAULT_BLUE_RIDGE = `The Roanoke Valley sits right in the heart of Virginia's Blue Ridge Mountains, which means we're blessed with some of the finest motorcycling roads in the country. The Blue Ridge Parkway is practically in our backyard, offering 469 miles of scenic, winding roads with virtually no commercial traffic.

Surrounding Roanoke County are 3 other counties that offer spectacular motorcycle roads — Franklin County, Patrick County and Craig County. Here are found some "twisties" that rival the famous Route 129 (The Tail of the Dragon) and Ohio Route 555 (The Triple Nickel). You can't beat the sweet sound of a Norton coming on full throttle while exiting a mountain curve!`;

const DEFAULT_INOA = `RVNO is proud to be affiliated with the International Norton Owners Association (INOA), a worldwide organization dedicated to the preservation and enjoyment of Norton motorcycles. Through INOA, we connect with Norton enthusiasts around the globe, access technical resources, and participate in events that celebrate these iconic British machines. Many of our members are also INOA members, benefiting from their excellent magazine, technical library, and international community.`;

export function AboutContent({
  introContent,
  valuesContent,
  blueRidgeContent,
  inoaContent,
}: AboutContentProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [intro, setIntro] = useState(introContent?.body || DEFAULT_INTRO);
  const [values, setValues] = useState(valuesContent?.body || DEFAULT_VALUES);
  const [blueRidge, setBlueRidge] = useState(
    blueRidgeContent?.body || DEFAULT_BLUE_RIDGE
  );
  const [inoa, setInoa] = useState(inoaContent?.body || DEFAULT_INOA);

  const [saving, setSaving] = useState(false);

  const parsedValues = (() => {
    try {
      return JSON.parse(values);
    } catch {
      return JSON.parse(DEFAULT_VALUES);
    }
  })();

  async function saveContent(pageKey: string, body: string) {
    setSaving(true);
    await supabase
      .from("page_content")
      .upsert({ page_key: pageKey, body, updated_at: new Date().toISOString() }, { onConflict: "page_key" });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          About RVNO
        </h1>
        <p className="font-body text-lg text-rvno-teal italic">
          Keeping Nortons alive in the Blue Ridge
        </p>
      </header>

      <EditableSection
        isAdmin={isAdmin}
        onSave={() => saveContent("about_intro", intro)}
        onCancel={() => setIntro(introContent?.body || DEFAULT_INTRO)}
        saving={saving}
        className="mb-10"
        editContent={
          <div>
            <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
              How We Got Started
            </h2>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={12}
              className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50 resize-none"
            />
            <p className="font-body text-xs text-rvno-ink-dim mt-2">
              Separate paragraphs with blank lines
            </p>
          </div>
        }
      >
        <section>
          <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
            How We Got Started
          </h2>
          <div className="space-y-4 font-body text-base text-rvno-ink-muted leading-relaxed">
            {intro.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      </EditableSection>

      <EditableSection
        isAdmin={isAdmin}
        onSave={() => saveContent("about_values", values)}
        onCancel={() => setValues(valuesContent?.body || DEFAULT_VALUES)}
        saving={saving}
        className="mb-10"
        editContent={
          <div>
            <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
              What We&apos;re About
            </h2>
            <p className="font-body text-sm text-rvno-ink-dim mb-4">
              Edit the JSON structure below. Each item needs &quot;title&quot; and &quot;text&quot; fields.
            </p>
            <textarea
              value={values}
              onChange={(e) => setValues(e.target.value)}
              rows={16}
              className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-mono text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50 resize-none"
            />
          </div>
        }
      >
        <section>
          <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
            What We&apos;re About
          </h2>
          <div className="font-body text-base text-rvno-ink-muted leading-relaxed mb-4">
            At its heart, RVNO is about three things:
          </div>
          <div className="space-y-3 mb-4">
            {parsedValues.items.map(
              (item: { title: string; text: string }) => (
                <div
                  key={item.title}
                  className="border-l-4 border-rvno-teal pl-4 py-1"
                >
                  <span className="font-display text-base font-semibold text-rvno-ink">
                    {item.title}:
                  </span>{" "}
                  <span className="font-body text-base text-rvno-ink-muted">
                    {item.text}
                  </span>
                </div>
              )
            )}
          </div>
          <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
            {parsedValues.closing}
          </p>
        </section>
      </EditableSection>

      <EditableSection
        isAdmin={isAdmin}
        onSave={() => saveContent("about_blue_ridge", blueRidge)}
        onCancel={() => setBlueRidge(blueRidgeContent?.body || DEFAULT_BLUE_RIDGE)}
        saving={saving}
        className="mb-10"
        editContent={
          <div>
            <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
              Our Backyard: The Blue Ridge Mountains
            </h2>
            <textarea
              value={blueRidge}
              onChange={(e) => setBlueRidge(e.target.value)}
              rows={8}
              className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50 resize-none"
            />
            <p className="font-body text-xs text-rvno-ink-dim mt-2">
              Separate paragraphs with blank lines
            </p>
          </div>
        }
      >
        <section>
          <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
            Our Backyard: The Blue Ridge Mountains
          </h2>
          <div className="space-y-4 font-body text-base text-rvno-ink-muted leading-relaxed">
            {blueRidge.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      </EditableSection>

      <EditableSection
        isAdmin={isAdmin}
        onSave={() => saveContent("about_inoa", inoa)}
        onCancel={() => setInoa(inoaContent?.body || DEFAULT_INOA)}
        saving={saving}
        editContent={
          <div className="bg-rvno-card rounded-lg border-2 border-rvno-border p-6">
            <h2 className="font-display text-xl font-semibold text-rvno-ink mb-3">
              Part of Something Bigger
            </h2>
            <textarea
              value={inoa}
              onChange={(e) => setInoa(e.target.value)}
              rows={6}
              className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50 resize-none"
            />
          </div>
        }
      >
        <section className="bg-rvno-card rounded-lg border-2 border-rvno-border p-6">
          <h2 className="font-display text-xl font-semibold text-rvno-ink mb-3">
            Part of Something Bigger
          </h2>
          <p className="font-body text-base text-rvno-ink-muted leading-relaxed mb-4">
            {inoa}
          </p>
          <a
            href="https://www.inoanorton.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-body text-base font-semibold text-rvno-teal hover:text-rvno-teal-dark transition-colors"
          >
            Visit INOA →
          </a>
        </section>
      </EditableSection>
    </div>
  );
}
