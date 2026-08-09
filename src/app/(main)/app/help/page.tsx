import Link from "next/link";
import {
  BookOpenIcon,
  CreditCardIcon,
  FileTextIcon,
  ImageIcon,
  LifeBuoyIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
} from "lucide-react";

const guides = [
  {
    title: "AI chat",
    description: "Start conversations, refine prompts, and regenerate responses.",
    href: "/app/chat",
    icon: MessageSquareIcon,
  },
  {
    title: "PDF documents",
    description: "Upload supported PDFs and ask grounded questions about their content.",
    href: "/app/pdf",
    icon: FileTextIcon,
  },
  {
    title: "Image generation",
    description: "Create and manage AI-generated images from the dashboard.",
    href: "/app/image",
    icon: ImageIcon,
  },
  {
    title: "Billing and usage",
    description: "Review plan limits, subscription status, and usage allowances.",
    href: "/app/billing",
    icon: CreditCardIcon,
  },
] as const;

export default function HelpPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-background to-pink-500/10 p-6 sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
          <LifeBuoyIcon className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Luro Help Center
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Find quick product guidance, account and billing resources, and a direct
          path to support without leaving your authenticated workspace.
        </p>
      </section>

      <section aria-labelledby="guides-heading">
        <div className="mb-4 flex items-center gap-2">
          <BookOpenIcon className="size-5 text-violet-400" aria-hidden="true" />
          <h2 id="guides-heading" className="text-xl font-semibold">
            Product guides
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl border border-border/70 bg-card/40 p-5 transition hover:border-violet-500/40 hover:bg-violet-500/5"
              >
                <Icon
                  className="size-5 text-violet-400 transition group-hover:scale-105"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-medium">{guide.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {guide.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
          <ShieldCheckIcon className="size-5 text-emerald-400" aria-hidden="true" />
          <h2 className="mt-4 font-semibold">Account and security</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Manage your profile, sign-in methods, password, active sessions, and
            account deletion from settings.
          </p>
          <Link
            href="/app/settings"
            className="mt-4 inline-flex text-sm font-medium text-violet-300 hover:text-violet-200"
          >
            Open account settings →
          </Link>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
          <LifeBuoyIcon className="size-5 text-pink-400" aria-hidden="true" />
          <h2 className="mt-4 font-semibold">Contact support</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Include your account email, the affected feature, and the approximate
            time of the issue so the team can investigate quickly.
          </p>
          <a
            href="mailto:support@luro.ai?subject=Luro%20AI%20Support"
            className="mt-4 inline-flex text-sm font-medium text-violet-300 hover:text-violet-200"
          >
            support@luro.ai →
          </a>
        </div>
      </section>
    </main>
  );
}
