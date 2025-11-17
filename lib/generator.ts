import { actionOptions, triggerOptions } from "./pinterest";

export interface AutomationPayload {
  name: string;
  description: string;
  triggerId: string;
  actionIds: string[];
  runMode: "immediate" | "scheduled" | "batch";
  schedule?: {
    frequency: "hourly" | "daily" | "weekly" | "cron";
    value: string;
  };
  region: "us2";
  qaSteps: string[];
  owner: string;
  webhooks: string[];
}

export function buildMakeBlueprint(payload: AutomationPayload) {
  const trigger = triggerOptions.find((option) => option.id === payload.triggerId);
  const actions = payload.actionIds
    .map((id) => actionOptions.find((option) => option.id === id))
    .filter(Boolean);

  return {
    name: payload.name,
    description: payload.description,
    region: payload.region,
    trigger: trigger
      ? {
          id: trigger.id,
          label: trigger.label,
          makeModule: mapTriggerToMakeModule(trigger.id)
        }
      : null,
    sequence: actions.map((action, index) => ({
      order: index + 1,
      id: action!.id,
      label: action!.label,
      makeModule: mapActionToMakeModule(action!.id)
    })),
    execution: payload.runMode,
    schedule: payload.schedule ?? null,
    qaChecklist: payload.qaSteps,
    ownership: payload.owner,
    webhooks: payload.webhooks
  };
}

function mapTriggerToMakeModule(triggerId: string) {
  switch (triggerId) {
    case "new-pin":
      return "pinterest/watch-pins";
    case "new-idea-pin":
      return "pinterest/watch-idea-pins";
    case "pin-engagement":
      return "pinterest/search-top-pins";
    case "weekly-analytics":
      return "schedule/weekly";
    default:
      return "custom-http/webhook";
  }
}

function mapActionToMakeModule(actionId: string) {
  switch (actionId) {
    case "create-pin":
      return "pinterest/create-pin";
    case "update-pin":
      return "pinterest/update-pin";
    case "google-sheet-row":
      return "google-sheets/add-row";
    case "slack-summary":
      return "slack/post-message";
    case "notion-database":
      return "notion/upsert-page";
    case "email-digest":
      return "gmail/send-email";
    default:
      return "toolbox/custom-code";
  }
}

export function generateImplementationSteps(blueprint: ReturnType<typeof buildMakeBlueprint>) {
  const lines: string[] = [];
  lines.push(`# Scenario Setup (${blueprint.region}.make.com)`);
  lines.push(`1. Create new scenario, set region to **${blueprint.region}**.`);

  if (blueprint.trigger) {
    lines.push(`2. Add trigger module: \
**${blueprint.trigger.makeModule}** (${blueprint.trigger.label}).`);
  } else {
    lines.push("2. Add initial module or webhook trigger.");
  }

  blueprint.sequence.forEach((step, index) => {
    lines.push(`${index + 3}. Add module: **${step.makeModule}** (${step.label}).`);
  });

  if (blueprint.execution === "scheduled" && blueprint.schedule) {
    lines.push(`Configure scheduler: ${blueprint.schedule.frequency} -> ${blueprint.schedule.value}.`);
  }

  if (blueprint.webhooks.length) {
    lines.push(
      `Configure webhooks: ${blueprint.webhooks
        .map((hook) => `\`${hook}\``)
        .join(", ")}.`
    );
  }

  lines.push("Enable scenario logging, save, and switch to ON.");
  lines.push("Run initial test with reduced data set.");
  return lines.join("\n");
}
