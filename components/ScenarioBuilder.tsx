"use client";

import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { actionOptions, triggerOptions } from "../lib/pinterest";
import { AutomationPayload, buildMakeBlueprint, generateImplementationSteps } from "../lib/generator";
import { AutomationSummary } from "./AutomationSummary";
import { ScenarioTemplatePicker } from "./ScenarioTemplatePicker";

const automationSchema = z
  .object({
    name: z.string().min(3),
    description: z.string().min(10),
    triggerId: z.string(),
    actionIds: z.array(z.string()).min(1),
    runMode: z.enum(["immediate", "scheduled", "batch"]),
    scheduleFrequency: z.enum(["hourly", "daily", "weekly", "cron"]).optional(),
    scheduleValue: z.string().optional(),
    qaSteps: z.array(z.object({ value: z.string().min(5) })).min(1),
    owner: z.string().min(3),
    webhooks: z.array(z.object({ value: z.string().url() })).optional()
  })
  .superRefine((values, ctx) => {
    if (values.runMode === "scheduled") {
      if (!values.scheduleFrequency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["scheduleFrequency"]
        });
      }
      if (!values.scheduleValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide schedule expression",
          path: ["scheduleValue"]
        });
      }
    }
  });

type AutomationFormValues = z.infer<typeof automationSchema>;

export function ScenarioBuilder() {
  const [blueprint, setBlueprint] = useState<ReturnType<typeof buildMakeBlueprint> | null>(null);
  const [stepsMarkdown, setStepsMarkdown] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    reset
  } = useForm<AutomationFormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: "Pinterest Automation",
      description: "",
      triggerId: triggerOptions[0]?.id ?? "new-pin",
      actionIds: [actionOptions[0]?.id ?? "create-pin"],
      runMode: "immediate",
      qaSteps: [
        {
          value: "Run scenario once in manual mode using sample data"
        }
      ],
      webhooks: []
    }
  });

  const qaArray = useFieldArray({ name: "qaSteps", control });
  const webhookArray = useFieldArray({ name: "webhooks", control });

  const selectedTrigger = watch("triggerId");
  const runMode = watch("runMode");
  const selectedActions = watch("actionIds");

  const selectedTriggerMeta = useMemo(
    () => triggerOptions.find((option) => option.id === selectedTrigger),
    [selectedTrigger]
  );

  const selectedActionMeta = useMemo(
    () => actionOptions.filter((action) => selectedActions?.includes(action.id)),
    [selectedActions]
  );

  const onSubmit = (values: AutomationFormValues) => {
    const payload: AutomationPayload = {
      name: values.name,
      description: values.description,
      triggerId: values.triggerId,
      actionIds: values.actionIds,
      runMode: values.runMode,
      region: "us2",
      qaSteps: values.qaSteps.map((step) => step.value),
      owner: values.owner,
      webhooks: values.webhooks?.map((hook) => hook.value) ?? []
    };

    if (values.runMode === "scheduled" && values.scheduleFrequency && values.scheduleValue) {
      payload.schedule = {
        frequency: values.scheduleFrequency,
        value: values.scheduleValue
      };
    }

    const blueprintResult = buildMakeBlueprint(payload);
    setBlueprint(blueprintResult);
    setStepsMarkdown(generateImplementationSteps(blueprintResult));
  };

  const handleTemplateSelect = (template: AutomationPayload) => {
    reset({
      ...template,
      qaSteps: template.qaSteps.map((value) => ({ value })),
      webhooks: template.webhooks.map((value) => ({ value })),
      scheduleFrequency: template.schedule?.frequency,
      scheduleValue: template.schedule?.value
    });
    const blueprintResult = buildMakeBlueprint(template);
    setBlueprint(blueprintResult);
    setStepsMarkdown(generateImplementationSteps(blueprintResult));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,3fr]">
      <div className="space-y-8">
        <ScenarioTemplatePicker onSelect={handleTemplateSelect} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Automation Name
            </label>
            <input id="name" placeholder="Pinterest Campaign Automation" {...register("name")} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="description">
              Scenario Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Describe the objective for stakeholders"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trigger Module</label>
            <div className="space-y-3">
              {triggerOptions.map((trigger) => (
                <label
                  key={trigger.id}
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2 transition ${
                    selectedTrigger === trigger.id
                      ? "border-pinterest/80 bg-pinterest/20"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    value={trigger.id}
                    className="mt-1"
                    {...register("triggerId")}
                  />
                  <div>
                    <p className="text-sm font-semibold">{trigger.label}</p>
                    <p className="text-xs text-slate-400">{trigger.description}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Requirements: {trigger.requirements.join(", ")}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Action Modules</label>
            <div className="grid gap-3">
              {actionOptions.map((action) => {
                const checked = selectedActions?.includes(action.id);
                return (
                  <label
                    key={action.id}
                    className={`flex gap-3 rounded-lg border px-3 py-2 transition ${
                      checked ? "border-pinterest/80 bg-pinterest/20" : "border-slate-800 bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={action.id}
                      className="mt-1"
                      {...register("actionIds")}
                    />
                    <div>
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="text-xs text-slate-400">{action.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Requirements: {action.requirements.join(", ")}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.actionIds && (
              <p className="text-xs text-red-400 mt-1">Select at least one downstream action</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Execution Mode</label>
            <div className="flex gap-4 text-sm">
              {(
                [
                  { value: "immediate", label: "Realtime" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "batch", label: "Batch" }
                ] as const
              ).map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input type="radio" value={option.value} {...register("runMode")} />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {runMode === "scheduled" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select {...register("scheduleFrequency")}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="cron">Cron</option>
                </select>
                {errors.scheduleFrequency && (
                  <p className="text-xs text-red-400 mt-1">{errors.scheduleFrequency.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expression / Time</label>
                <input placeholder="Mon @ 08:00 EST" {...register("scheduleValue")} />
                {errors.scheduleValue && (
                  <p className="text-xs text-red-400 mt-1">{errors.scheduleValue.message}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Automation Owner</label>
            <input placeholder="growth-team@company.com" {...register("owner")} />
            {errors.owner && <p className="text-xs text-red-400 mt-1">{errors.owner.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">QA Checklist</label>
              <button
                type="button"
                className="bg-slate-800 text-xs px-3 py-1 rounded-md"
                onClick={() => qaArray.append({ value: "" })}
              >
                + Add step
              </button>
            </div>
            <div className="grid gap-2">
              {qaArray.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <textarea
                    rows={2}
                    className="flex-1"
                    placeholder="Describe validation step"
                    {...register(`qaSteps.${index}.value` as const)}
                  />
                  <button
                    type="button"
                    className="bg-slate-800 px-3 py-1 text-xs"
                    onClick={() => qaArray.remove(index)}
                    disabled={qaArray.fields.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {errors.qaSteps && <p className="text-xs text-red-400">Provide QA coverage</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Webhook callbacks (optional)</label>
              <button
                type="button"
                className="bg-slate-800 text-xs px-3 py-1 rounded-md"
                onClick={() => webhookArray.append({ value: "https://" })}
              >
                + Add webhook
              </button>
            </div>
            <div className="grid gap-2">
              {webhookArray.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    className="flex-1"
                    placeholder="https://example.com/webhook"
                    {...register(`webhooks.${index}.value` as const)}
                  />
                  <button
                    type="button"
                    className="bg-slate-800 px-3 py-1 text-xs"
                    onClick={() => webhookArray.remove(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-2 font-semibold">
            Generate Make.com Blueprint
          </button>
        </form>
      </div>

      <div className="space-y-8">
        <AutomationSummary
          blueprint={blueprint}
          stepsMarkdown={stepsMarkdown}
          trigger={selectedTriggerMeta ?? null}
          actions={selectedActionMeta}
        />
      </div>
    </div>
  );
}
