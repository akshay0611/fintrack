import { Container } from "./primitives";

const TRUSTED_LOGOS = [
  {
    name: "Notion",
    glyph: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    name: "Figma",
    glyph: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="6" r="4" />
        <circle cx="6" cy="18" r="4" />
        <circle cx="18" cy="18" r="4" />
      </svg>
    ),
  },
  {
    name: "Linear",
    glyph: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 20h20L12 2z" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    glyph: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l10 18H2L12 2z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    glyph: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
];

export default function TrustedBy() {
  return (
    <section className="w-full py-8">
      <Container>
        <div className="rounded-3xl bg-surface px-6 py-12">
          <p className="mb-8 text-center text-small text-ink-muted">
            Trusted by individuals who take control of their finances
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-70">
            {TRUSTED_LOGOS.map(({ name, glyph }) => (
              <span
                key={name}
                className="flex items-center gap-2 text-body-lg font-semibold"
              >
                {glyph}
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
