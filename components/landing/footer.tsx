import { Container } from "./primitives";

/*
 * The reference points these at /privacy, /terms and /contact, none of which
 * exist in this application yet — see the handover notes. They are plain
 * anchors (rather than next/link) so the router does not prefetch 404s.
 */
const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-line">
      <Container className="flex flex-col items-center gap-4 py-8 text-center text-small text-ink-muted sm:flex-row sm:justify-between sm:text-left">
        <span>© {new Date().getFullYear()} FinTrack. All rights reserved.</span>

        <nav aria-label="Footer" className="flex gap-6">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-opacity hover:opacity-70"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
