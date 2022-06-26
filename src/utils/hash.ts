import { EditorState } from "../components/Editor/Editor";
import {
  Browser,
  ManifestVersion,
  PlaygroundState,
} from "../components/StateProvider/StateProvider";

export interface HashState {
  browser: Browser;
  manifestVersion: ManifestVersion;
  includePolyfill: boolean;
  templateId: string;
  files: {
    name: string;
    text: string;
  }[];
}

export function updateHash(
  playgroundState: PlaygroundState,
  editorState: EditorState
) {
  const params = new URLSearchParams();
  const state: HashState = {
    browser: playgroundState.selectedBrowser,
    manifestVersion: playgroundState.manifestVersion,
    includePolyfill: playgroundState.includePolyfill,
    templateId: playgroundState.selectedTemplate.id,
    files: editorState.files.map((f) => ({
      name: f.name,
      text: f.model ? f.model.getValue() : f.text,
    })),
  };
  params.set("state", btoa(JSON.stringify(state)));
  window.location.hash = params.toString();
}

export function parseHash(): HashState | undefined {
  if (!window.location.hash) return undefined;

  try {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const state = params.get("state");
    return state ? JSON.parse(atob(state)) : undefined;
  } catch {
    return undefined;
  }
}
