import type {
  Sandbox,
  SandboxConfig,
  TypeScriptWorker,
} from "@typescript/sandbox";

import browserTypesUrl from "url:../static/browser.d.ts.txt";

window.require.config({
  paths: {
    vs: "https://typescript.azureedge.net/cdn/4.0.5/monaco/min/vs",
    sandbox: "https://www.typescriptlang.org/js/sandbox",
  },
  // This is something you need for monaco to work
  ignoreDuplicateModules: ["vs/editor/editor.main"],
});

export async function loadSandbox(): Promise<Sandbox> {
  const browserTypesResponse = await fetch(browserTypesUrl);
  const browserTypes = await browserTypesResponse.text();

  const chromeTypesResponse = await fetch(
    "https://unpkg.com/@types/chrome@0.0.190/index.d.ts"
  );
  const chromeTypes = await chromeTypesResponse.text();

  return new Promise((resolve) => {
    window.require(
      [
        "vs/editor/editor.main",
        "vs/language/typescript/tsWorker",
        "sandbox/index",
      ],
      (
        main: any,
        _tsWorker: TypeScriptWorker,
        sandboxModule: typeof import("@typescript/sandbox")
      ) => {
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

        const sandbox = sandboxModule.createTypeScriptSandbox(
          sandboxConfig,
          main,
          window.ts
        );
        sandbox.languageServiceDefaults.setExtraLibs([
          { content: browserTypes, filePath: "browser.d.ts" },
          { content: chromeTypes, filePath: "chrome.d.ts" },
        ]);
        sandbox.editor.focus();

        resolve(sandbox);
      }
    );
  });
}
