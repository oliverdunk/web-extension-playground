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
      text: (context) =>
        `
${context.global}.runtime.onInstalled.addListener((details) => {
  console.log("Extension has been installed. Reason:", details.reason);
});

function handleMessage(
  request: { greeting: string },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: { response: string }) => void
) {
  console.log("A content script sent a message:", request.greeting);
  sendResponse({ response: "Response from background script" });
}

chrome.runtime.onMessage.addListener(handleMessage);
console.log("Hello World!");
      `.trim(),
    },
    {
      name: "content_script.ts",
      text: (context) => {
        let notifyBackgroundPageImpl;
        if (context.browser === "Chrome" && context.manifestVersion === "MV2") {
          // Chrome doesn't support the promise-based interface in MV2, so we use
          // the callback interface instead
          notifyBackgroundPageImpl = `
function notifyBackgroundPage() {
  ${context.global}.runtime.sendMessage(
    {
      greeting: "Greeting from the content script",
    },
    handleResponse
  );
}          
          `.trim();
        } else {
          notifyBackgroundPageImpl = `
function notifyBackgroundPage() {
  const sending = ${context.global}.runtime.sendMessage({
    greeting: "Greeting from the content script",
  });
  sending.then(handleResponse);
}
          `.trim();
        }

        return `
function handleResponse(message: { response: string }) {
  console.log("Response from the background script:", message.response);
}

${notifyBackgroundPageImpl}

notifyBackgroundPage();
        `.trim();
      },
    },
  ],
};
