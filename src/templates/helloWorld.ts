import { Template } from "./index";

export const HelloWorld: Template = {
  id: "helloWorld",
  name: "Hello World",
  manifest: {
    name: "Hello World",
    description: "Basic Hello World Extension",
    backgroundScripts: ["background.js"],
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
  ],
};
