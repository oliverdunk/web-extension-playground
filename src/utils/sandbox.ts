import {
  createTypeScriptSandbox,
  Sandbox,
  SandboxConfig,
} from "@typescript/sandbox";

import * as monaco from "monaco-editor";
import * as typescript from "typescript";

import browserTypesUrl from "url:../static/browser.d.ts.txt";

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === "json") {
      return "./json.worker.js";
    }
    if (label === "css" || label === "scss" || label === "less") {
      return "./css.worker.js";
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return "./html.worker.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./ts.worker.js";
    }
    return "./editor.worker.js";
  },
};

export async function loadSandbox(): Promise<Sandbox> {
  const browserTypesResponse = await fetch(browserTypesUrl);
  const browserTypes = await browserTypesResponse.text();

  const chromeTypesResponse = await fetch(
    "https://unpkg.com/@types/chrome@latest/index.d.ts"
  );
  const chromeTypes = await chromeTypesResponse.text();

  return new Promise((resolve) => {
    const sandboxConfig: SandboxConfig = {
      text: "",
      compilerOptions: {},
      domID: "editor",
      monacoSettings: {
        // @ts-expect-error This type is missing from the Monaco types
        tabSize: 2,
        automaticLayout: true,
        wordWrap: "on",
      },
      // TODO: We default this to false, since we don't want to promise types
      // for packages which aren't installed, but we should provide users
      // with a way to enable it.
      acquireTypes: false,
    };

    const sandbox = createTypeScriptSandbox(sandboxConfig, monaco, typescript);
    sandbox.languageServiceDefaults.setExtraLibs([
      { content: browserTypes, filePath: "browser.d.ts" },
      { content: chromeTypes, filePath: "chrome.d.ts" },
    ]);
    sandbox.editor.focus();

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: true,
    });

    resolve(sandbox);
  });
}
