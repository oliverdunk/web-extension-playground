import { Template } from "./index";

export const DNR: Template = {
  id: "dnr",
  name: "URL Blocker",
  manifest: {
    name: "URL Blocker",
    description: "Blocks requests to example.com.",
    backgroundScripts: ["background.js"],
    permissions: {
      declarativeNetRequest: true,
    },
    dnrRules: [{ id: "ruleset_1", path: "rules_1.json" }],
  },
  files: [
    {
      name: "background.ts",
      text: (context) =>
        `
${context.global}.runtime.onInstalled.addListener((details) => {
  console.log("Extension has been installed. Reason:", details.reason);
});

console.log("Hello World!");
      `.trim(),
    },
    {
      name: "rules_1.json",
      text: () =>
        `
[
  {
    "id": 1,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "example.com*",
      "resourceTypes": ["main_frame"]
    }
  }
]      
      `.trim(),
    },
  ],
  // In Chrome, DNR is only available in MV3
  filter: (state) =>
    state.selectedBrowser !== "Chrome" || state.manifestVersion === "MV3",
};
