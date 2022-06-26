import styles from "./Sidebar.scss";
import { templates } from "../../templates";
import { useContext } from "react";
import {
  PlaygroundContext,
  PlaygroundState,
} from "../StateProvider/StateProvider";

export function Sidebar() {
  const { playgroundState, setPlaygroundState } = useContext(PlaygroundContext);
  const { selectedTemplate, selectedBrowser, manifestVersion } =
    playgroundState;

  function setStateWithConfirmation(newState: Partial<PlaygroundState>) {
    if (
      !playgroundState.hasEditedModel ||
      window.confirm(
        "Changing the template, selected browser or API version will overwrite any changes. Continue?"
      )
    ) {
      setPlaygroundState({
        ...playgroundState,
        hasEditedModel: false,
        ...newState,
      });
    }
  }

  return (
    <div className={styles.sidebar}>
      <h1>WebExtension Playground</h1>
      <h2>Templates</h2>
      <ul>
        {templates.map((t) => (
          <li
            data-selected={selectedTemplate === t ? "true" : undefined}
            onClick={() => {
              setStateWithConfirmation({ selectedTemplate: t });
            }}
          >
            {t.name}
          </li>
        ))}
      </ul>
      <h2>Browsers</h2>
      <ul>
        {["Chrome", "Firefox", "Safari"].map(
          (b: "Chrome" | "Firefox" | "Safari") => (
            <li
              data-selected={selectedBrowser === b ? "true" : undefined}
              onClick={() => setStateWithConfirmation({ selectedBrowser: b })}
            >
              {b}
            </li>
          )
        )}
      </ul>
      <h2>API Version</h2>
      <ul>
        {["MV2", "MV3"].map((v: "MV2" | "MV3") => (
          <li
            data-selected={manifestVersion === v ? "true" : undefined}
            onClick={() => setStateWithConfirmation({ manifestVersion: v })}
          >
            {v === "MV2" ? "Manifest V2" : "Manifest V3"}
          </li>
        ))}
      </ul>
    </div>
  );
}
