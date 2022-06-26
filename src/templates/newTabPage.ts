import { Template } from "./index";

export const NewTabPage: Template = {
  name: "New Tab Page",
  files: [
    {
      name: "manifest.json",
      text: () =>
        `
{
  "name": "New Tab Page",
  "version": "0.1",
  "manifest_version": 2,
  "description": "Basic New Tab Page Extension",
  "background": {
    "scripts": ["background.js"]
  },
  "chrome_url_overrides" : {
    "newtab": "new_tab_page.html"
  }
}
      `.trim(),
    },
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
