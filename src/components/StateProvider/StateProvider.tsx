import React, { useEffect, useState } from "react";
import { Template, templates } from "../../templates";

export type Browser = "Chrome" | "Firefox" | "Safari";
export type ManifestVersion = "MV2" | "MV3";
export type Theme = "Light" | "Dark";

export interface PlaygroundState {
  selectedTemplate: Template;
  selectedBrowser: Browser;
  manifestVersion: ManifestVersion;
  includePolyfill: boolean;
  theme: Theme;
  hasEditedModel: boolean;
}

export const PlaygroundContext = React.createContext<{
  playgroundState: PlaygroundState;
  setPlaygroundState: (state: PlaygroundState) => void;
}>(undefined as any);

export function StateProvider({ children }: { children: JSX.Element }) {
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    selectedTemplate: templates[0],
    selectedBrowser: "Chrome",
    manifestVersion: "MV2",
    includePolyfill: false,
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "Dark"
      : "Light",
    hasEditedModel: false,
  });

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
