export type TriggerCategory = "content" | "engagement" | "analytics";

export interface TriggerOption {
  id: string;
  label: string;
  description: string;
  category: TriggerCategory;
  requirements: string[];
}

export interface ActionOption {
  id: string;
  label: string;
  description: string;
  service: "pinterest" | "make" | "google" | "notion" | "slack" | "email";
  requirements: string[];
}

export const triggerOptions: TriggerOption[] = [
  {
    id: "new-pin",
    label: "New Pin Published",
    description: "Runs whenever a new Pin is published to a specific board.",
    category: "content",
    requirements: ["Pinterest business account", "Board ID"]
  },
  {
    id: "new-idea-pin",
    label: "New Idea Pin",
    description: "Monitors Idea Pin publishing events for storytelling formats.",
    category: "content",
    requirements: ["Idea Pin template", "Creator permissions"]
  },
  {
    id: "pin-engagement",
    label: "Pin Engagement Spike",
    description: "Detects when repins or saves exceed a defined threshold.",
    category: "engagement",
    requirements: ["Pinterest analytics API token", "Threshold definition"]
  },
  {
    id: "weekly-analytics",
    label: "Weekly Analytics Snapshot",
    description: "Scheduled trigger that pulls analytics every Monday 8am (us2).",
    category: "analytics",
    requirements: ["Pinterest analytics API token"]
  }
];

export const actionOptions: ActionOption[] = [
  {
    id: "create-pin",
    label: "Create Pinterest Pin",
    description: "Uploads a new Pin to a selected board with provided media.",
    service: "pinterest",
    requirements: ["Image URL", "Destination link", "Board ID"]
  },
  {
    id: "update-pin",
    label: "Update Pin Metadata",
    description: "Updates title, notes, or alt text on an existing Pin.",
    service: "pinterest",
    requirements: ["Pin ID", "Fields to update"]
  },
  {
    id: "google-sheet-row",
    label: "Append Google Sheet Row",
    description: "Adds analytics or publishing metadata to a Google Sheet log.",
    service: "google",
    requirements: ["Google service account", "Spreadsheet ID"]
  },
  {
    id: "slack-summary",
    label: "Send Slack Summary",
    description: "Posts campaign results into a Slack channel.",
    service: "slack",
    requirements: ["Slack bot token", "Channel ID"]
  },
  {
    id: "notion-database",
    label: "Sync to Notion Database",
    description: "Creates or updates a Notion database item with Pin metrics.",
    service: "notion",
    requirements: ["Notion integration token", "Database ID"]
  },
  {
    id: "email-digest",
    label: "Email Digest",
    description: "Builds an HTML email digest for stakeholders and sends via Gmail module.",
    service: "email",
    requirements: ["Verified sender", "Recipient list"]
  }
];

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  triggerId: string;
  actionIds: string[];
  scenarioMap: string[];
  verificationChecklist: string[];
}

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: "content-distribution",
    name: "Content Distribution Engine",
    description:
      "Publishes new blog content to Pinterest, logs it, and pings Slack for visibility.",
    triggerId: "weekly-analytics",
    actionIds: ["create-pin", "google-sheet-row", "slack-summary"],
    scenarioMap: [
      "HTTP module pulls new CMS entries",
      "Iterator loops assets",
      "Pinterest > Create Pin",
      "Google Sheets > Add row",
      "Slack > Post message"
    ],
    verificationChecklist: [
      "Run the scenario with a single CMS entry in manual mode",
      "Confirm new Pin appears on the target board",
      "Check that the Google Sheet row contains UTM parameters",
      "Verify Slack message formatting matches the campaign template"
    ]
  },
  {
    id: "engagement-alerts",
    name: "Engagement Surge Alerts",
    description:
      "Detects high performing Pins and notifies the growth team with actionable metrics.",
    triggerId: "pin-engagement",
    actionIds: ["slack-summary", "notion-database"],
    scenarioMap: [
      "Pinterest Analytics > Search pins",
      "Filter module for saves > threshold",
      "Slack > Send message",
      "Notion > Upsert database item"
    ],
    verificationChecklist: [
      "Run test with mocked analytics data via CSV module",
      "Validate Slack message contains CTA buttons",
      "Check Notion record includes direct Pin link and owner"
    ]
  },
  {
    id: "idea-pin-workflow",
    name: "Idea Pin Workflow",
    description:
      "Streamlines Idea Pin production with drafts, approvals, and scheduled publishing.",
    triggerId: "new-idea-pin",
    actionIds: ["update-pin", "email-digest"],
    scenarioMap: [
      "Pinterest > Watch Idea Pins",
      "Router > Approval path",
      "Email > Request feedback",
      "Delay > Wait for approval",
      "Pinterest > Update Pin metadata"
    ],
    verificationChecklist: [
      "Confirm drafts enter approval column in Notion board",
      "Test rejection branch exits gracefully",
      "Validate final publish status toggles to Approved"
    ]
  }
];
