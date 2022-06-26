import React, { useState } from "react";
import { Template, templates } from "../../templates";

export interface PlaygroundState {
  selectedTemplate: Template;
  selectedBrowser: "Chrome" | "Firefox" | "Safari";
  includePolyfill: boolean;
}

export const PlaygroundContext = React.createContext<{
  playgroundState: PlaygroundState;
  setPlaygroundState: (state: PlaygroundState) => void;
}>(undefined);

export function StateProvider({ children }) {
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    selectedTemplate: templates[0],
    selectedBrowser: "Chrome",
    includePolyfill: false,
  });

  return (
    <PlaygroundContext.Provider value={{ playgroundState, setPlaygroundState }}>
      {children}
    </PlaygroundContext.Provider>
  );
}
