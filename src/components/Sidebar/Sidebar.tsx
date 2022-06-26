import styles from "./Sidebar.scss";
import { templates } from "../../templates";
import { useContext } from "react";
import { PlaygroundContext } from "../StateProvider/StateProvider";

export function Sidebar() {
  const { playgroundState, setPlaygroundState } = useContext(PlaygroundContext);
  const { selectedTemplate, selectedBrowser } = playgroundState;

  return (
    <div className={styles.sidebar}>
      <h1>WebExtension Playground</h1>
      <h2>Templates</h2>
      <ul>
        {templates.map((t) => (
          <li data-selected={selectedTemplate === t ? "true" : undefined}>
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
              onClick={() =>
                setPlaygroundState({ ...playgroundState, selectedBrowser: b })
              }
            >
              {b}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
