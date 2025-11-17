"use client";

import { useMemo } from "react";
import { TriggerOption, ActionOption } from "../lib/pinterest";

interface Props {
  blueprint: {
    name: string;
    description: string;
    region: string;
    trigger: {
      id: string;
      label: string;
      makeModule: string;
    } | null;
    sequence: {
      order: number;
      id: string;
      label: string;
      makeModule: string;
    }[];
    execution: "immediate" | "scheduled" | "batch";
    schedule: {
      frequency: string;
      value: string;
    } | null;
    qaChecklist: string[];
    ownership: string;
    webhooks: string[];
  } | null;
  stepsMarkdown: string;
  trigger: TriggerOption | null;
  actions: ActionOption[];
}

export function AutomationSummary({ blueprint, stepsMarkdown, trigger, actions }: Props) {
  const requirements = useMemo(() => {
    const triggerReqs = trigger?.requirements ?? [];
    const actionReqs = actions.flatMap((action) => action.requirements);
    return Array.from(new Set([...triggerReqs, ...actionReqs]));
  }, [trigger, actions]);

  if (!blueprint) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <h2 className="text-xl font-semibold">Blueprint Output</h2>
        <p className="mt-4 text-sm text-slate-400">
          Configure your scenario on the left to generate US2 Make.com build steps, documentation, and QA
          guidance tailored for Pinterest automations.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-pinterest/5">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Scenario Overview</h2>
          <span className="rounded-full bg-pinterest/20 px-3 py-1 text-xs font-semibold text-pinterest">
            Region: {blueprint.region}
          </span>
        </header>
        <p className="mt-4 text-sm text-slate-300">{blueprint.description}</p>
        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="uppercase text-xs tracking-wide text-slate-500">Owner</dt>
            <dd className="text-slate-200">{blueprint.ownership}</dd>
          </div>
          <div>
            <dt className="uppercase text-xs tracking-wide text-slate-500">Execution mode</dt>
            <dd className="text-slate-200 capitalize">{blueprint.execution}</dd>
            {blueprint.schedule && (
              <p className="text-xs text-slate-400">
                {blueprint.schedule.frequency} → {blueprint.schedule.value}
              </p>
            )}
          </div>
          <div>
            <dt className="uppercase text-xs tracking-wide text-slate-500">Trigger module</dt>
            <dd className="text-slate-200">
              {blueprint.trigger ? `${blueprint.trigger.makeModule}` : "Custom setup"}
            </dd>
          </div>
          <div>
            <dt className="uppercase text-xs tracking-wide text-slate-500">Downstream actions</dt>
            <dd className="text-slate-200">
              {blueprint.sequence.map((item) => item.makeModule).join(" → ")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="text-lg font-semibold">Implementation Checklist</h3>
        <ol className="mt-4 space-y-3 text-sm text-slate-300">
          {stepsMarkdown.split("\n").map((line, index) => (
            <li key={`${line}-${index}`} className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-3">
              {line}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="text-lg font-semibold">Credential & Asset Requirements</h3>
        <ul className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
          {requirements.map((item) => (
            <li
              key={item}
              className="rounded-md border border-slate-800/60 bg-slate-900/60 px-3 py-2 text-xs uppercase tracking-wide text-slate-400"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="text-lg font-semibold">QA Validation</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {blueprint.qaChecklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-pinterest" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {blueprint.webhooks.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
          <ul className="mt-4 space-y-2 text-sm text-pinterest-light">
            {blueprint.webhooks.map((hook) => (
              <li key={hook}>
                <code className="rounded bg-slate-950 px-2 py-1 text-xs">{hook}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
