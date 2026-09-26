import Link from "next/link";

import { Container, PrimaryCta } from "./primitives";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <header className="w-full border-b border-line bg-white">
      <Container className="flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-logo"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="5" fill="white" opacity="0.9" />
            </svg>
          </span>
          FinTrack
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 text-body font-medium md:inline-flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-opacity hover:opacity-70"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden text-body font-medium transition-opacity hover:opacity-70 md:inline-flex"
          >
            Log in
          </Link>
          <PrimaryCta href="/sign-up">Get started</PrimaryCta>
        </div>
      </Container>
    </header>
  );
}
