import { EditorState } from "./Editor";

export const HelloWorld: EditorState = {
  files: [
    {
      name: "manifest.json",
      text: `
{
  "name": "Hello World",
  "version": "0.1",
  "manifest_version": 2,
  "description": "Basic Hello World Extension",
  "background": {
    "scripts": ["background.js"]
  }
}
      `.trim(),
    },
    {
      name: "background.ts",
      text: `
browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension has been installed. Reason:", details.reason);
});

console.log("Hello World!");
      `.trim(),
    },
  ],
};
