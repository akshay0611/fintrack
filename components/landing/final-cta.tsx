import { Check } from "lucide-react";

import { Container, PrimaryCta } from "./primitives";

const TRUST_ITEMS = [
  "No credit card required",
  "Free forever plan",
  "Your data stays private",
];

export default function FinalCta() {
  return (
    <section className="w-full border-t border-line py-12">
      <Container className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 max-w-cta-heading text-h-4 font-extrabold tracking-display md:text-h-2-sm">
            Ready to take control of your finances?
          </h2>
          <p className="text-body text-ink-muted">
            Join thousands of users who are building better financial habits with
            FinTrack.
          </p>
        </div>

        <div className="flex flex-col items-start gap-8 md:items-end">
          <PrimaryCta href="/sign-up">Get started — Free</PrimaryCta>

          <ul className="flex flex-wrap gap-6 text-small text-ink-muted">
            {TRUST_ITEMS.map((label) => (
              <li key={label} className="flex items-center gap-2">
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-success"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
