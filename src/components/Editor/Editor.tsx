import { useContext, useEffect, useState } from "react";
import styles from "./Editor.scss";
import { generateManifest, Template, templates } from "../../templates";
import browserTypesUrl from "url:../../static/browser.d.ts.txt";
import JSZip from "jszip";
import { downloadBlob } from "../../utils/download";
import type {
  Sandbox,
  SandboxConfig,
  TypeScriptWorker,
} from "@typescript/sandbox";
import {
  PlaygroundContext,
  PlaygroundState,
} from "../StateProvider/StateProvider";

window.require.config({
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
    model?: import("monaco-editor").editor.IModel;
  }[];
}

async function loadSandbox(): Promise<Sandbox> {
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
        main,
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

async function getOutput(file: EditorState["files"][0]) {
  if (!file.model) return file.text;
  if (!file.name.endsWith(".ts")) return file.model.getValue();

  const worker = await (
    await monaco.languages.typescript.getTypeScriptWorker()
  )(file.model.uri);
  const output = await worker.getEmitOutput(file.model.uri.toString());
  return output.outputFiles[0].text;
}

async function downloadProject(state: EditorState) {
  const zip = new JSZip();

  for (const file of state.files) {
    zip.file(file.name.replace(/.ts$/, ".js"), await getOutput(file));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "extension.zip");
}

function setFile(sandbox, file: EditorState["files"][0]) {
  let model = file.model;

  if (!model) {
    model = file.model = monaco.editor.createModel(
      file.text,
      undefined,
      new monaco.Uri().with({ path: file.name })
    );
  }

  sandbox.editor.setModel(model);
}

function loadTemplate(
  editorState: EditorState,
  template: Template,
  playgroundState: PlaygroundState
): EditorState {
  // Load in new files
  const files = template.files.map((f): EditorState["files"][0] => ({
    name: f.name,
    text: f.text(getBrowserGlobal(playgroundState)),
  }));

  files.unshift({
    name: "manifest.json",
    text: generateManifest(
      playgroundState.selectedBrowser,
      playgroundState.manifestVersion,
      template.manifest
    ),
  });

  // Instead of closing all tabs, update files with matching names, and discard
  // any that are no longer needed.
  for (const file of editorState.files) {
    const newFile = files.find((f) => f.name === file.name);

    if (newFile) {
      file.model?.setValue(newFile.text);
      newFile.model = file.model;
    } else {
      file.model?.dispose();
    }
  }

  return { files };
}

function getBrowserGlobal(state: PlaygroundState) {
  return state.selectedBrowser === "Chrome" && !state.includePolyfill
    ? "chrome"
    : "browser";
}

export function Editor() {
  const { playgroundState, setPlaygroundState } = useContext(PlaygroundContext);
  const [state, setState] = useState<EditorState>({ files: [] });
  const [activeFile, setActiveFile] =
    useState<EditorState["files"][0]>(undefined);
  const [sandbox, setSandbox] = useState<Sandbox>();

  useEffect(() => {
    if (window.editorLoaded) return;

    window.editorLoaded = true;
    loadSandbox().then(setSandbox);
  });

  useEffect(() => {
    if (!sandbox || !activeFile) return;
    setFile(sandbox, activeFile);
  }, [sandbox, activeFile]);

  useEffect(() => {
    const newState = loadTemplate(
      state,
      playgroundState.selectedTemplate,
      playgroundState
    );
    setState(newState);
    setActiveFile(
      (activeFile && newState.files.find((f) => f.name === activeFile.name)) ??
        newState.files[0]
    );
  }, [
    playgroundState.selectedTemplate,
    playgroundState.selectedBrowser,
    playgroundState.manifestVersion,
  ]);

  useEffect(() => {
    if (!sandbox) return;

    const changeListener = sandbox.editor.onDidChangeModelContent(() => {
      setPlaygroundState({ ...playgroundState, hasEditedModel: true });
    });

    return () => changeListener.dispose();
  }, [sandbox, playgroundState]);

  if (!state) return null;

  return (
    <div className={styles.editor}>
      <nav>
        <ul>
          {state.files.map((file) => (
            <li
              key={file.name}
              data-selected={activeFile === file ? "true" : undefined}
              onClick={() => {
                setActiveFile(file);
              }}
            >
              {file.name}
            </li>
          ))}
        </ul>
        <button onClick={() => downloadProject(state)}>Download</button>
      </nav>
      <div id="editor"></div>
    </div>
  );
}
