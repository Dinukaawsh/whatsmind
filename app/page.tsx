import Link from "next/link";
import { getMindOverview } from "@/lib/sample-data";
import { InsightForm } from "@/components/insight-form";

export default async function Home() {
  const overview = getMindOverview();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative isolate px-6 py-20 sm:px-12 md:px-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Ritual Ops • Sample build
            </p>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Whats Mind keeps every conversation, ritual, and follow-up in
                flow.
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                This starter mirrors the structure of your mail automation hub
                while staying minimal: an opinionated UI, a typed API, and a
                place to try ideas before wiring real data.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="mailto:team@whatsmind.com"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-200"
                >
                  Book a working session
                </Link>
                <a
                  href="https://nextjs.org/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                >
                  View platform playbook
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-200">
              Signal snapshot
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Active streams",
                  value: overview.metrics.totalStreams,
                },
                {
                  label: "Positive sentiment",
                  value: `${overview.metrics.positiveRate}%`,
                },
                {
                  label: "Critical tracks",
                  value: overview.metrics.criticalStreams,
                },
                {
                  label: "Open action items",
                  value: overview.metrics.activeActionItems,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                >
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Generated {new Date(overview.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-slate-900/40 px-6 py-16 sm:px-12 md:px-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-lime-300">Streams</p>
            <h2 className="text-2xl font-semibold text-white">
              Latest conversations from the field
            </h2>
            <p className="text-sm text-slate-400">
              Each card is sourced from the sample backend. Swap it with your
              CRM, LLM, or data warehouse once you are ready.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {overview.snapshots.map((snapshot) => (
              <article
                key={snapshot.id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {snapshot.channel} • {snapshot.owner}
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                      {snapshot.topic}
                    </h3>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    data-sentiment={snapshot.sentiment}
                  >
                    {snapshot.sentiment}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{snapshot.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  {snapshot.focusAreas.map((focus) => (
                    <span
                      key={focus}
                      className="rounded-full border border-white/10 px-3 py-1"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Action items
                  </p>
                  <ul className="mt-3 space-y-2">
                    {snapshot.actionItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-sm text-slate-200"
                      >
                        <span>{item.description}</span>
                        <span className="text-xs text-slate-500">
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-slate-500">
                  Updated {new Date(snapshot.updatedAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-16 sm:px-12 md:px-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-lime-300">
              Prototype faster
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Drop a note — see the API reply in real time.
            </h2>
            <p className="text-slate-300">
              The form below talks to `/api/snapshots`. Extend it to push real
              rituals, send Slack updates, or trigger sequences in the mail
              product when you are ready.
            </p>
            <InsightForm />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            <p className="font-semibold text-white">How to extend</p>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Replace sample data in `lib/sample-data.ts`.</li>
              <li>• Swap `/api/snapshots` with your real orchestrator.</li>
              <li>• Mirror `mail-app` patterns for auth, queues, logs.</li>
              <li>• Deploy both apps with the included Docker assets.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
