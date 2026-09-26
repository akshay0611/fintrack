import Image from "next/image";
import { CreditCard, Infinity as InfinityIcon, Play, Shield } from "lucide-react";

import { Container, Eyebrow, PrimaryCta, SecondaryCta } from "./primitives";

const TRUST_ITEMS = [
  { icon: CreditCard, label: "No credit card required" },
  { icon: InfinityIcon, label: "Free forever plan" },
  { icon: Shield, label: "Your data stays private" },
];

export default function Hero() {
  return (
    <section className="w-full pb-8 pt-16">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow className="mb-6">Personal finance, simplified</Eyebrow>

          <h1 className="mb-6 text-h-1-sm font-extrabold tracking-display lg:text-h-1">
            Track today.
            <br />
            A better
            <br />
            <span className="text-brand">tomorrow.</span>
          </h1>

          <p className="mb-8 max-w-hero-copy text-body-lg text-ink-muted">
            FinTrack helps you track expenses, understand your spending habits,
            and build better financial decisions — all in one place.
          </p>

          <div className="mb-12 flex flex-wrap items-center gap-4">
            <PrimaryCta href="/sign-up">Get started — Free</PrimaryCta>
            <SecondaryCta
              href="#demo"
              leadingIcon={<Play fill="currentColor" strokeWidth={0} aria-hidden="true" />}
            >
              Watch demo
            </SecondaryCta>
          </div>

          <ul className="grid max-w-hero-copy grid-cols-3 gap-6 text-small text-ink-muted">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col gap-2">
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <Image
            src="/images/dashboard-desktop.webp"
            alt="FinTrack dashboard showing total spending, income, savings, a monthly spending chart, top categories and recent transactions, with the mobile home screen overlapping in front"
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 552px, calc(100vw - 48px)"
            priority
            className="h-auto w-full rounded-3xl shadow-elevated"
          />
        </div>
      </Container>
    </section>
  );
}
