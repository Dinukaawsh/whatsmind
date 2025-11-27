"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

interface InsightDraft {
  id: string;
  topic: string;
  note: string;
  owner?: string;
  sentimentHint?: string;
  createdAt?: string;
  nextSteps?: string[];
}

export const InsightForm = () => {
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [draft, setDraft] = useState<InsightDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setTopic("");
    setNote("");
    setOwner("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          note,
          owner: owner || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unexpected error");
      }

      const data = (await response.json()) as InsightDraft;
      setDraft(data);
      setState("success");
      resetForm();
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-6"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Topic</label>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Product rituals, billing review, campaign retro..."
            className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-lime-300"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Owner</label>
          <input
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="Ops, CSM, Growth..."
            className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-lime-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Note</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What was said? Where are the blockers?"
            rows={4}
            className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-lime-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-200 disabled:opacity-50"
        >
          {state === "loading" ? "Saving..." : "Create snapshot"}
        </button>

        {state === "error" && (
          <p className="text-sm text-red-300">Error: {errorMessage}</p>
        )}
      </form>

      {draft && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            API response
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p className="font-semibold text-white">{draft.topic}</p>
            <p className="text-slate-300">{draft.note}</p>
            <p className="text-xs text-slate-500">
              Draft ID: {draft.id} • {draft.sentimentHint} sentiment
            </p>
            {draft.nextSteps && (
              <ul className="mt-3 space-y-2">
                {draft.nextSteps.map((step) => (
                  <li key={step} className="text-slate-300">
                    • {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


