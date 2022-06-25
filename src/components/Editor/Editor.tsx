import { useEffect, useRef, useState } from "react";
import styles from "./Editor.scss";
import * as templates from "./templates";
import browserTypesUrl from "url:../../static/browser.d.ts.txt";

(window as any).require.config({
  paths: {
    vs: "https://typescript.azureedge.net/cdn/4.0.5/monaco/min/vs",
    sandbox: "https://www.typescriptlang.org/js/sandbox",
  },
  // This is something you need for monaco to work
  ignoreDuplicateModules: ["vs/editor/editor.main"],
});

export interface EditorState {
  files: {
    name: string;
    text: string;
    model?: any;
  }[];
}

async function loadSandbox(): Promise<any> {
  const browserTypesResponse = await fetch(browserTypesUrl);
  const browserTypes = await browserTypesResponse.text();

  const chromeTypesResponse = await fetch(
    "https://unpkg.com/@types/chrome@0.0.190/index.d.ts"
  );
  const chromeTypes = await chromeTypesResponse.text();

  return new Promise((resolve) => {
    (window as any).require(
      [
        "vs/editor/editor.main",
        "vs/language/typescript/tsWorker",
        "sandbox/index",
      ],
      (main, _tsWorker, sandboxFactory) => {
        const sandboxConfig = {
          text: "",
          compilerOptions: {},
          domID: "editor",
          monacoSettings: {
            tabSize: 2,
          },
          // TODO: We default this to false, since we don't want to promise types
          // for packages which aren't installed, but we should provide users
          // with a way to enable it.
          acquireTypes: false,
        };

        const sandbox = sandboxFactory.createTypeScriptSandbox(
          sandboxConfig,
          main,
          (window as any).ts
        );
        sandbox.languageServiceDefaults.addExtraLib(
          browserTypes,
          "browser.d.ts"
        );
        sandbox.languageServiceDefaults.addExtraLib(chromeTypes, "chrome.d.ts");
        sandbox.editor.focus();

        resolve(sandbox);
      }
    );
  });
}

function setFile(sandbox, file: EditorState["files"][0]) {
  let model = file.model;

  if (!model) {
    const monaco = (window as any).monaco;
    model = file.model = monaco.editor.createModel(
      file.text,
      undefined,
      new monaco.Uri().with({ path: file.name })
    );
  }

  sandbox.editor.setModel(model);
}

export function Editor() {
  const [template, setTemplate] = useState<EditorState>(templates.HelloWorld);
  const [activeFile, setActiveFile] = useState<EditorState["files"][0]>(
    template.files[0]
  );
  const [sandbox, setSandbox] = useState<any>();

  useEffect(() => {
    if ((window as any).editorLoaded) return;

    (window as any).editorLoaded = true;
    loadSandbox().then(setSandbox);
  });

  useEffect(() => {
    if (!sandbox) return;
    setFile(sandbox, activeFile);
  }, [sandbox, activeFile]);

  return (
    <div className={styles.editor}>
      <nav>
        <ul>
          {template.files.map((file) => (
            <li
              data-selected={activeFile === file ? "true" : undefined}
              onClick={() => {
                setActiveFile(file);
              }}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </nav>
      <div id="editor"></div>
    </div>
  );
}
