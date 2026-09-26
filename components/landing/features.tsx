import { Clock, Shield, User } from "lucide-react";

import FeatureCard from "./feature-card";
import { Container, Eyebrow, SecondaryCta } from "./primitives";

const FEATURES = [
  {
    id: "expense-tracking",
    icon: User,
    iconClassName: "bg-surface-green text-brand-ink",
    title: "Expense Tracking",
    description: "Log transactions in seconds and keep everything organized.",
    image: "/images/expense-tracking.webp",
    imageAlt: "Add Expense form with amount, note, category and date fields",
    imageWidth: 1312,
    imageHeight: 1199,
  },
  {
    id: "budget-planning",
    icon: Clock,
    iconClassName: "bg-blue-100 text-blue-600",
    title: "Budget Planning",
    description: "Set clear budgets, monitor your progress, and avoid overspending.",
    image: "/images/budget-planning.webp",
    imageAlt: "Monthly budget list with progress bars per category",
    imageWidth: 1009,
    imageHeight: 779,
  },
  {
    id: "insightful-reports",
    icon: Shield,
    iconClassName: "bg-purple-100 text-purple-600",
    title: "Insightful Reports",
    description: "Understand where your money goes with clear, visual reports.",
    image: "/images/insightful-reports.webp",
    imageAlt: "Spending by category donut chart with percentage breakdown",
    imageWidth: 1009,
    imageHeight: 779,
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-24">
      <Container>
        <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
          <div>
            <Eyebrow>Everything you need</Eyebrow>
            <h2 className="text-h-2-sm font-extrabold tracking-display md:text-h-2">
              Powerful features to manage your money
            </h2>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-feature-desc text-body text-ink-muted">
              From everyday expenses to long-term goals, FinTrack gives you the
              tools to stay on top of your finances without the complexity.
            </p>
            <SecondaryCta href="#features" arrow>
              Explore all features
            </SecondaryCta>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
