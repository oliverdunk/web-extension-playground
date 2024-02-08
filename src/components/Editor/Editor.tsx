import { useContext, useEffect, useState } from "react";
import styles from "./Editor.scss";
import { generateManifest, Template } from "../../templates";
import JSZip from "jszip";
import { downloadBlob } from "../../utils/download";
import type { Sandbox } from "@typescript/sandbox";
import {
  PlaygroundContext,
  PlaygroundState,
} from "../StateProvider/StateProvider";
import {
  BsClipboard,
  BsCode,
  BsDownload,
  BsLink45Deg,
  BsTrash,
} from "react-icons/bs/index";
import { Modal } from "../Modal/Modal";
import { getHash, updateHash } from "../../utils/hash";
import { loadSandbox } from "../../utils/sandbox";

export interface EditorState {
  files: {
    name: string;
    text: string;
    /**
     * @deprecated Prefer {@link getOrCreateModel()}.
     */
    model?: import("monaco-editor").editor.IModel;
  }[];
}

async function getOutput(
  file: EditorState["files"][0],
  includePolyfill: boolean
) {
  const model = getOrCreateModel(file);
  if (!file.name.endsWith(".ts")) return model.getValue();

  const worker = await (
    await monaco.languages.typescript.getTypeScriptWorker()
  )(model.uri);
  const output = await worker.getEmitOutput(model.uri.toString());
  let text = output.outputFiles[0].text;

  if (includePolyfill) {
    const polyfillResponse = await fetch(
      "https://unpkg.com/webextension-polyfill@0.9.0/dist/browser-polyfill.min.js"
    );
    const polyfill = await polyfillResponse.text();

    text = polyfill + text;
  }

  return text;
}

async function downloadProject(state: EditorState, includePolyfill: boolean) {
  const zip = new JSZip();

  for (const file of state.files) {
    zip.file(
      file.name.replace(/.ts$/, ".js"),
      await getOutput(file, includePolyfill)
    );
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "extension.zip");
}

function getOrCreateModel(
  file: EditorState["files"][0]
): import("monaco-editor").editor.IModel {
  if (!file.model) {
    file.model = monaco.editor.createModel(
      file.text,
      undefined,
      new monaco.Uri().with({ path: file.name })
    );
  }

  return file.model;
}

function setFile(sandbox: Sandbox, file: EditorState["files"][0]) {
  sandbox.editor.setModel(getOrCreateModel(file));
}

function loadTemplate(
  existingState: EditorState | undefined,
  template: Template,
  playgroundState: PlaygroundState
): EditorState {
  // Load in new files
  const files = template.files.map((f): EditorState["files"][0] => ({
    name: f.name,
    text: f.text({
      global: getBrowserGlobal(playgroundState),
      browser: playgroundState.selectedBrowser,
      manifestVersion: playgroundState.manifestVersion,
    }),
  }));

  files.unshift({
    name: "manifest.json",
    text: generateManifest(
      playgroundState.selectedBrowser,
      playgroundState.manifestVersion,
      template.manifest
    ),
  });

  if (existingState) {
    // Instead of closing all tabs, update files with matching names, and discard
    // any that are no longer needed.
    for (const file of existingState.files) {
      const newFile = files.find((f) => f.name === file.name);

      if (newFile) {
        file.model?.setValue(newFile.text);
        newFile.model = file.model;
      } else {
        file.model?.dispose();
      }
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
  const [state, setState] = useState<EditorState | undefined>();
  const [activeFile, setActiveFile] = useState<
    EditorState["files"][0] | undefined
  >(undefined);
  const [sandbox, setSandbox] = useState<Sandbox>();
  const [showingSafariModal, setShowingSafariModal] = useState(false);
  const [showingShareModal, setShowingShareModal] = useState(false);
  const [codeIntegrationEnabled, setCodeIntegrationEnabled] = useState(false);
  const [showingCodeModal, setShowingCodeModal] = useState(false);
  const [addingFile, setAddingFile] = useState(false);

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
    const newState =
      (!state && playgroundState.initialEditorState) ||
      loadTemplate(state, playgroundState.selectedTemplate, playgroundState);
    setState(newState);
    setActiveFile(
      (activeFile && newState.files.find((f) => f.name === activeFile.name)) ??
        newState.files[0]
    );
  }, [
    playgroundState.selectedTemplate,
    playgroundState.selectedBrowser,
    playgroundState.manifestVersion,
    playgroundState.includePolyfill,
  ]);

  useEffect(() => {
    if (!sandbox || !state) return;

    const changeListener = sandbox.editor.onDidChangeModelContent(() => {
      updateHash(playgroundState, state);
      setPlaygroundState({ ...playgroundState, hasEditedModel: true });
    });

    return () => changeListener.dispose();
  }, [sandbox, playgroundState]);

  useEffect(() => {
    if (!sandbox) return;
    monaco.editor.setTheme(
      playgroundState.theme === "Dark" ? "sandbox-dark" : "sandbox"
    );
  }, [sandbox, playgroundState.theme]);

  useEffect(() => {
    (window as any).enableCodeIntegration = () => setCodeIntegrationEnabled(true);
  }, [setCodeIntegrationEnabled]);

  if (!state) return null;

  const shareLink = window.location.href;

  return (
    <div className={styles.editor}>
      <nav>
        <ul>
          {state.files.map((file, index) => (
            <li
              key={file.name}
              data-selected={activeFile === file ? "true" : undefined}
              onClick={() => {
                setActiveFile(file);
              }}
            >
              {file.name}
              {file.name !== "manifest.json" && (
                <BsTrash
                  onClick={(evt) => {
                    evt.stopPropagation();
                    file.model?.dispose();
                    state.files.splice(index, 1);

                    if (activeFile === file) {
                      setActiveFile(state.files[index - 1]);
                    }

                    setState({ ...state });
                  }}
                />
              )}
            </li>
          ))}
          <li
            onClick={() => setAddingFile(true)}
            data-selected={addingFile ? "true" : undefined}
          >
            {addingFile ? (
              <input
                type="text"
                placeholder="file.ts"
                autoFocus
                onBlur={() => setAddingFile(false)}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {
                    const name = (evt.target as HTMLInputElement).value.trim();
                    if (!name.match(/^[a-zA-Z0-9_-]+\.[a-zA-Z]+$/)) return;
                    if (state.files.find((f) => f.name === name)) return;

                    const file = { name, text: "" };
                    setState({
                      ...state,
                      files: [...state.files, file],
                    });
                    setActiveFile(file);
                    setAddingFile(false);
                  }
                }}
              />
            ) : (
              "+"
            )}
          </li>
        </ul>
        <div className={styles.actions}>
          <button
            title="Download"
            onClick={() => {
              downloadProject(
                state,
                playgroundState.includePolyfill &&
                  playgroundState.selectedBrowser === "Chrome"
              );

              if (playgroundState.selectedBrowser === "Safari") {
                setShowingSafariModal(true);
              }
            }}
          >
            <BsDownload />
          </button>
          <button
            className={styles.share}
            title="Copy Link"
            onClick={() => {
              updateHash(playgroundState, state);
              setShowingShareModal(true);
            }}
          >
            <BsLink45Deg />
          </button>
          {codeIntegrationEnabled && (
            <button
              className={styles.share}
              title="Open in VS Code"
              onClick={() => {
                window.location.href = `vscode://patrickkettner.web-extensions-sync/load-project#s=${getHash(playgroundState, state)}`;
                setShowingCodeModal(true);
              }}
            >
              <BsCode />
            </button>
          )}
        </div>
      </nav>
      <div id="editor"></div>
      <Modal isOpen={showingSafariModal}>
        <h1>Using your Safari download</h1>
        <p>
          Safari requires extensions to be part of an enclosing app, which
          requires an Xcode project. Unzip the downloaded file and run the
          following on the resulting folder:
        </p>
        <code>xcrun safari-web-extension-converter extension</code>
        <button type="submit" onClick={() => setShowingSafariModal(false)}>
          Ok
        </button>
      </Modal>
      <Modal
        isOpen={showingShareModal}
        onRequestClose={() => setShowingShareModal(false)}
      >
        <h1>Share your project</h1>
        <p>
          To share your project, just copy this unique link. It contains all of
          the data about your current editor state.
        </p>
        <div className={styles.shareLink}>
          <input
            id="shareLink"
            type="text"
            value={shareLink}
            readOnly
            disabled
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareLink);
            }}
          >
            <BsClipboard />
          </button>
        </div>
      </Modal>
      <Modal isOpen={showingCodeModal}>
        <h1>Opening in VS Code...</h1>
        <p>
          If you have the <a href="https://marketplace.visualstudio.com/items?itemName=patrickkettner.web-extensions-sync" target="_blank">web-extensions-sync</a> extension installed in VS Code, a new editor window with this project should have opened.
        </p>
        <button type="submit" onClick={() => setShowingCodeModal(false)}>
          Got It
        </button>
      </Modal>
    </div>
  );
}
