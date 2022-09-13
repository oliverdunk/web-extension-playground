import React, { useEffect, useState } from "react";
import { Template, templates } from "../../templates";
import { parseHash } from "../../utils/hash";
import { EditorState } from "../Editor/Editor";

export type Browser = "Chrome" | "Firefox" | "Safari";
export type ManifestVersion = "MV2" | "MV3";
export type Theme = "Light" | "Dark";

export interface PlaygroundState {
  selectedTemplate: Template;
  selectedBrowser: Browser;
  manifestVersion: ManifestVersion;
  includePolyfill: boolean;
  theme: Theme;
  initialEditorState?: EditorState;
  hasEditedModel: boolean;
}

export const PlaygroundContext = React.createContext<{
  playgroundState: PlaygroundState;
  setPlaygroundState: (state: PlaygroundState) => void;
}>(undefined as any);

function getInitialState(): PlaygroundState {
  const hashState = parseHash();

  return {
    selectedTemplate:
      (hashState && templates.find((t) => t.id === hashState.templateId)) ??
      templates[0],
    selectedBrowser: hashState?.browser ?? "Chrome",
    manifestVersion: hashState?.manifestVersion ?? "MV2",
    includePolyfill: hashState?.includePolyfill ?? false,
    theme: "Dark",
    initialEditorState: hashState && {
      files: hashState.files.map((f) => ({
        name: f.name,
        text: f.text,
      })),
    },
    hasEditedModel: !!hashState,
  };
}

export function StateProvider({ children }: { children: JSX.Element }) {
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>(
    getInitialState()
  );

  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      playgroundState.theme.toLowerCase()
    );
  }, [playgroundState.theme]);

  return (
    <PlaygroundContext.Provider value={{ playgroundState, setPlaygroundState }}>
      {children}
    </PlaygroundContext.Provider>
  );
}
