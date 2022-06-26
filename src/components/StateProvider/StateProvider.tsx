import React, { useState } from "react";
import { Template, templates } from "../../templates";

export type Browser = "Chrome" | "Firefox" | "Safari";
export type ManifestVersion = "MV2" | "MV3";

export interface PlaygroundState {
  selectedTemplate: Template;
  selectedBrowser: Browser;
  manifestVersion: ManifestVersion;
  includePolyfill: boolean;
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
    hasEditedModel: false,
  });

  return (
    <PlaygroundContext.Provider value={{ playgroundState, setPlaygroundState }}>
      {children}
    </PlaygroundContext.Provider>
  );
}
