import Image from "next/image";

import { Container, Eyebrow, StoreBadge } from "./primitives";

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.017-.1-.05-.4-.05-.7 0-1.1.55-2.2 1.2-2.94.75-.85 2.03-1.53 3.04-1.57.03.16.06.35.06.63zm4.5 15.44c-.37.86-.55 1.24-1.03 2-.66 1.05-1.6 2.36-2.75 2.37-1.02.01-1.29-.67-2.68-.66-1.39.01-1.68.67-2.7.66-1.15-.01-2.04-1.19-2.7-2.24-1.86-2.94-2.05-6.4-.9-8.24.81-1.3 2.1-2.06 3.3-2.06 1.22 0 1.99.67 3 .67.98 0 1.58-.67 3-.67 1.06 0 2.19.58 2.99 1.58-2.63 1.44-2.2 5.2.47 6.59z" />
    </svg>
  );
}

function PlayStoreGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 20.5V3.5c0-.6.32-1.14.83-1.42L14.3 12 3.83 21.92A1.63 1.63 0 0 1 3 20.5zM16 12l3.4-1.96c.9.5.9 1.86 0 2.36L16 12zm-1.44-1.15L5.4 2.47l10.09 5.82-.93.9zm0 2.3l.93.9L5.4 21.53l9.16-8.38z" />
    </svg>
  );
}

const STORE_BADGES = [
  { id: "app-store", label: "Download on the", sublabel: "App Store", icon: <AppleGlyph /> },
  { id: "google-play", label: "GET IT ON", sublabel: "Google Play", icon: <PlayStoreGlyph /> },
];

export default function MobileShowcase() {
  return (
    <section className="w-full pb-24">
      <Container>
        <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-3xl bg-surface-green lg:grid-cols-2">
          <div className="px-8 py-12 lg:p-16">
            <Eyebrow className="bg-white">On the go</Eyebrow>

            <h2 className="my-6 text-h-2-sm font-extrabold tracking-display lg:text-h-1-snug">
              Your finances, wherever you are.
            </h2>

            <p className="mb-8 max-w-showcase-lead text-body text-ink-soft">
              Track expenses, check budgets, and get insights anytime, anywhere.
              Available on iOS and Android.
            </p>

            <div className="flex flex-wrap gap-3">
              {STORE_BADGES.map((badge) => (
                <StoreBadge
                  key={badge.id}
                  href="#"
                  label={badge.label}
                  sublabel={badge.sublabel}
                  icon={badge.icon}
                />
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[280px] items-end justify-end overflow-hidden py-6 pl-4 pr-0 sm:min-h-[340px] lg:min-h-0 lg:py-10 lg:pl-0">
            <Image
              src="/images/mobile-overview.png"
              alt="FinTrack mobile transactions list next to a monthly spending summary chart with category breakdown"
              width={1928}
              height={816}
              sizes="(min-width: 1024px) 620px, 100vw"
              className="h-auto w-[135%] max-w-none translate-x-[8%] object-contain object-right lg:w-[128%] lg:translate-x-[12%]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
