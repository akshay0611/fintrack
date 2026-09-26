import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared building blocks for the public landing page. These are intentionally
 * thin: they only exist so repeated layout/CTA styling stays in one place and
 * every call site still renders plain semantic markup.
 */

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-landing px-6", className)} {...props} />
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-surface-green px-3.5 py-1.5 text-small font-medium text-brand-ink",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ArrowGlyph() {
  return <ArrowRight strokeWidth={2.5} aria-hidden="true" />;
}

const pillShape =
  "h-auto rounded-full px-[22px] py-3 text-body font-semibold whitespace-nowrap disabled:opacity-50 [&_svg]:size-3.5";

export function PrimaryCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      className={cn(
        pillShape,
        "border border-cta bg-cta text-white shadow-none transition-opacity hover:bg-cta hover:opacity-90 focus-visible:ring-cta",
        className
      )}
    >
      <Link href={href}>
        {children}
        <ArrowGlyph />
      </Link>
    </Button>
  );
}

export function SecondaryCta({
  href,
  children,
  arrow = false,
  leadingIcon,
  className,
}: {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  leadingIcon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        pillShape,
        "border-line bg-transparent text-ink shadow-none transition-colors hover:bg-surface hover:text-ink",
        className
      )}
    >
      <Link href={href}>
        {leadingIcon}
        {children}
        {arrow ? <ArrowGlyph /> : null}
      </Link>
    </Button>
  );
}

export function StoreBadge({
  href,
  label,
  sublabel,
  icon,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-[12px] font-semibold leading-[1.3] text-white transition-opacity hover:opacity-90 [&_svg]:size-4"
    >
      {icon}
      <span>
        {label}
        <span className="mt-px block text-[14px]">{sublabel}</span>
      </span>
    </a>
  );
}
