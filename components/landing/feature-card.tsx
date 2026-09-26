import Image from "next/image";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type FeatureCardProps = {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export default function FeatureCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
}: FeatureCardProps) {
  return (
    <article className="flex flex-col rounded-3xl border border-line p-6">
      <span
        aria-hidden="true"
        className={cn(
          "mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl",
          iconClassName
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mb-2 text-h-3 font-bold">{title}</h3>
      <p className="mb-6 text-body text-ink-muted">{description}</p>

      <div className="mt-auto overflow-hidden rounded-2xl border border-line">
        <Image
          src={image}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          sizes="(min-width: 1024px) 352px, calc(100vw - 48px)"
          className="h-auto w-full"
        />
      </div>
    </article>
  );
}
