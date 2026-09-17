import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { briefingQueryOptions } from "@/lib/threat-queries";

export const Route = createFileRoute("/awareness")({
  head: () => ({
    meta: [
      { title: "Awareness & Best Practices — CyberGuard" },
      {
        name: "description",
        content:
          "Practical cyber safety practices, phishing checks and protection steps tied to the threats active right now.",
      },
      { property: "og:title", content: "Awareness & Best Practices — CyberGuard" },
      {
        property: "og:description",
        content: "Simple, actionable steps to protect yourself and your organisation online.",
      },
    ],
  }),
  component: AwarenessPage,
});

const evergreen = [
  {
    title: "Phishing quick check",
    steps: [
      "Unexpected urgency or threats to close your account",
      "Sender address that almost matches the real brand",
      "Links that don't match the text when you hover",
      "Requests for OTPs, passwords or payment changes",
    ],
  },
  {
    title: "Ten-minute hardening",
    steps: [
      "Turn on two-factor authentication for email and banking",
      "Install pending updates on phone, laptop and router",
      "Use a password manager; never reuse a password",
      "Back up important files somewhere offline",
    ],
  },
];

function AwarenessPage() {
  const { data, isPending, error, refetch } = useQuery(briefingQueryOptions);

  return (
    <div className="space-y-6">
      <header>
        <span className="label-mono text-primary">Protection</span>
        <h1 className="mt-2 text-3xl font-bold">Awareness &amp; best practices</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Guidance refreshed alongside the live feed, so the advice matches what attackers are
          actually doing this week.
        </p>
      </header>

      {isPending ? <LoadingPanel label="Preparing guidance" /> : null}
      {error ? <ErrorPanel message={(error as Error).message} onRetry={() => refetch()} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {data?.awareness.map((item) => (
          <article key={item.title} className="panel p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <span className="ml-auto rounded-full border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[0.65rem] tracking-widest uppercase text-muted-foreground">
                {item.audience}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
            <ul className="mt-4 space-y-2">
              {item.steps.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-low" />
                  {step}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {evergreen.map((card) => (
          <article key={card.title} className="panel border-primary/30 p-5">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <ul className="mt-3 space-y-2">
              {card.steps.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {step}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
