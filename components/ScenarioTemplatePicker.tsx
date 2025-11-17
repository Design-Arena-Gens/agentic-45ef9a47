"use client";

import { useState } from "react";
import { scenarioTemplates } from "../lib/pinterest";
import { AutomationPayload } from "../lib/generator";

interface Props {
  onSelect: (payload: AutomationPayload) => void;
}

export function ScenarioTemplatePicker({ onSelect }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelect = (templateId: string) => {
    const template = scenarioTemplates.find((item) => item.id === templateId);
    if (!template) return;

    const payload: AutomationPayload = {
      name: template.name,
      description: template.description,
      triggerId: template.triggerId,
      actionIds: template.actionIds,
      runMode: template.triggerId === "weekly-analytics" ? "scheduled" : "immediate",
      region: "us2",
      qaSteps: template.verificationChecklist,
      owner: "marketing-automation@company.com",
      webhooks: [],
      schedule:
        template.triggerId === "weekly-analytics"
          ? { frequency: "weekly", value: "Monday 08:00 EST" }
          : undefined
    };

    setSelectedTemplate(templateId);
    onSelect(payload);
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Scenario Templates</h2>
          <p className="text-xs text-slate-400">Kickstart with curated Pinterest automation blueprints.</p>
        </div>
      </header>
      <div className="space-y-4">
        {scenarioTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => handleSelect(template.id)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition ${
              selectedTemplate === template.id
                ? "border-pinterest bg-pinterest/15 shadow-lg shadow-pinterest/30"
                : "border-slate-800 bg-slate-950/60 hover:border-pinterest/60"
            }`}
          >
            <h3 className="font-semibold text-slate-100">{template.name}</h3>
            <p className="mt-2 text-xs text-slate-400">{template.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-slate-500">
              <span className="rounded bg-slate-800/80 px-2 py-1">Trigger: {template.triggerId}</span>
              <span className="rounded bg-slate-800/80 px-2 py-1">Actions: {template.actionIds.length}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
