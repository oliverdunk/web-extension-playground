import { Template } from "./index";

export const NewTabPage: Template = {
  id: "newTabPage",
  name: "New Tab Page",
  manifest: {
    name: "New tab Page",
    description: "Basic New Tab Page Extension",
    backgroundScripts: ["background.js"],
    newTabPage: "new_tab_page.html",
  },
  files: [
    {
      name: "background.ts",
      text: (global) =>
        `
console.log("Hello World!");
      `.trim(),
    },
    {
      name: "new_tab_page.html",
      text: () =>
        `
<h1>Hello World!</h1>
      `.trim(),
    },
  ],
};
