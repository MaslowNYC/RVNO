export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Get in Touch
        </h1>
        <p className="font-body text-sm text-rvno-ink-muted italic">
          Want to join us? Got a Norton collecting dust? Know a good joke? Drop
          us a line.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="space-y-5">
          <div>
            <h3 className="font-mono text-[10px] text-rvno-teal tracking-wide uppercase mb-1.5">
              Email
            </h3>
            <a
              href="mailto:mark@roanokevalleynortonowners.com"
              className="font-body text-sm text-rvno-ink hover:text-rvno-teal transition-colors no-underline"
            >
              mark@roanokevalleynortonowners.com
            </a>
          </div>

          <div>
            <h3 className="font-mono text-[10px] text-rvno-teal tracking-wide uppercase mb-1.5">
              Location
            </h3>
            <p className="font-body text-sm text-rvno-ink-muted">
              Roanoke Valley, Virginia
              <br />
              Blue Ridge Mountains
            </p>
          </div>
        </div>

        {/* About joining */}
        <div className="bg-rvno-card rounded-lg border border-white/[0.06] p-5">
          <h3 className="font-display text-base font-semibold text-rvno-ink mb-3">
            About Joining
          </h3>
          <div className="space-y-3 font-body text-sm text-rvno-ink-muted leading-relaxed">
            <p>
              RVNO is an informal group with no membership fees or complicated
              requirements. If you appreciate Norton motorcycles and enjoy good
              company, you&apos;re already qualified.
            </p>
            <p>
              The best way to get started is to attend one of our monthly
              meetups. It&apos;s casual, friendly, and you&apos;ll quickly get a
              sense of whether we&apos;re your kind of people (we probably are).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
