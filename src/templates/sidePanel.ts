import { Template } from "./index";

export const SidePanel: Template = {
  id: "sidePanel",
  name: "Side Panel",
  manifest: {
    name: "Side Panel",
    description: "Basic Side Panel Extension",
    backgroundScripts: ["background.js"],
    permissions: {
      sidePanel: true,
    },
    sidepanelPath: "sidepanel.html",
  },
  files: [
    {
      name: "background.ts",
      text: (global) =>
        `
${global}.runtime.onInstalled.addListener((details) => {
  console.log("Extension has been installed. Reason:", details.reason);
});

console.log("Hello World!");
      `.trim(),
    },
    {
      name: "sidepanel.html",
      text: () =>
        `
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
      `.trim(),
    },
  ],
  // Side Panel is not currently supported in Safari
  filter: (state) =>
    state.selectedBrowser === "Chrome" || state.selectedBrowser === "Firefox",
};
