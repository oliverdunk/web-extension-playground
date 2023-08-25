import { Template } from "./index";

export const ContentScript: Template = {
  id: "contentScript",
  name: "Content Script",
  manifest: {
    name: "Content Script",
    description: "Basic Content Script Extension",
    backgroundScripts: ["background.js"],
    contentScripts: [
      {
        matches: ["<all_urls>"],
        js: ["content_script.js"],
      },
    ],
  },
  files: [
    {
      name: "background.ts",
      text: (global) =>
        `
${global}.runtime.onInstalled.addListener((details) => {
  console.log("Extension has been installed. Reason:", details.reason);
});

function handleMessage(request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  console.log("A content script sent a message:", request.greeting);
  sendResponse({ response: "Response from background script" });
}

chrome.runtime.onMessage.addListener(handleMessage);
console.log("Hello World!");
      `.trim(),
    },
    {
      name: "content_script.ts",
      text: (global) =>
        `
function handleResponse(message: any) {
  console.log("Response from the background script:", message.response);
}

function notifyBackgroundPage() {
  const sending = ${global}.runtime.sendMessage({
    greeting: "Greeting from the content script",
  });
  sending.then(handleResponse);
}

notifyBackgroundPage();
      `.trim(),
    },
  ],
};
