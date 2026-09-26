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
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
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

        {/* Graphic column: intentionally NOT centered/contained the way the
            copy column is — the reference lets this bleed slightly past the
            container's implicit right edge on wide screens. mx-auto here
            only centers it on mobile/tablet before the lg breakpoint. */}
        <div className="relative mx-auto w-full max-w-[552px] lg:mx-0 lg:ml-auto lg:max-w-none">
          {/* Desktop mockup: this file already has its own rounded card,
              tilt and drop shadow baked in on a plain white canvas — do
              NOT add rounded-* or shadow-* here, it doubles the box/shadow
              and produces a visible rectangular frame around the artwork. */}
          <Image
            src="/images/dashboard-desktop.webp"
            alt="FinTrack dashboard showing total spending, income, savings, a monthly spending chart, top categories and recent transactions"
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 552px, calc(100vw - 48px)"
            priority
            className="h-auto w-full"
          />

          {/* Phone overlay — actual asset is 559x961 (portrait); the
              width/height below MUST match the real file or Next/Image
              will compute the wrong aspect ratio and stretch it. This one
              genuinely has a transparent background, so drop-shadow-2xl
              (which follows the alpha silhouette) is correct here. */}
          <div className="pointer-events-none absolute right-[-4%] top-[34%] z-10 w-[32%] max-w-[215px]">
            <Image
              src="/images/dashboard-mobile-transparent.png"
              alt="FinTrack mobile home screen showing this month's spending total, trend chart, quick-add actions and top categories"
              width={559}
              height={961}
              sizes="(min-width: 1024px) 215px, 32vw"
              priority
              className="h-auto w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}