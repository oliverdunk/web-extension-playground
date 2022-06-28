import { EditorState } from "../components/Editor/Editor";
import {
  Browser,
  ManifestVersion,
  PlaygroundState,
} from "../components/StateProvider/StateProvider";
import lzstring from "../vendor/lzstring.min";

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
  params.set(
    "s",
    lzstring.compressToEncodedURIComponent(JSON.stringify(state))
  );
  window.location.hash = params.toString();
}

export function parseHash(): HashState | undefined {
  if (!window.location.hash) return undefined;

  try {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const newState = params.get("s");

    // New format with unicode support
    if (newState) {
      return JSON.parse(lzstring.decompressFromEncodedURIComponent(newState));
    }

    // Original format (was only around for a day, could potentially remove)
    const state = params.get("state");
    return state ? JSON.parse(atob(state)) : undefined;
  } catch {
    return undefined;
  }
}
