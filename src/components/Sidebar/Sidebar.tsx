import styles from "./Sidebar.scss";
import { templates } from "../../templates";
import { useContext, useState } from "react";
import {
  Browser,
  ManifestVersion,
  PlaygroundContext,
  PlaygroundState,
} from "../StateProvider/StateProvider";
import {
  BsCaretDownFill,
  BsCaretUpFill,
  BsCheckCircle,
  BsCheckCircleFill,
  BsMoon,
  BsMoonFill,
} from "react-icons/bs";

export function Sidebar() {
  const { playgroundState, setPlaygroundState } = useContext(PlaygroundContext);
  const { selectedTemplate, selectedBrowser, manifestVersion } =
    playgroundState;

  const [showingMobileMenu, setShowingMobileMenu] = useState(false);

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
      window.location.hash = "";
    }
  }

  const browsers: Browser[] = ["Chrome", "Firefox", "Safari"];
  const manifestVersions: ManifestVersion[] = ["MV2", "MV3"];

  return (
    <div
      className={styles.sidebar}
      aria-expanded={showingMobileMenu ? "true" : "false"}
    >
      <header>
        <h1>WebExtension Playground</h1>
        <button onClick={() => setShowingMobileMenu(!showingMobileMenu)}>
          {!showingMobileMenu ? <BsCaretDownFill /> : <BsCaretUpFill />}
        </button>
      </header>
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
        {browsers.map((b: Browser) => (
          <li
            data-selected={selectedBrowser === b ? "true" : undefined}
            onClick={() => setStateWithConfirmation({ selectedBrowser: b })}
          >
            {b}
          </li>
        ))}
      </ul>
      <h2>API Version</h2>
      <ul>
        {manifestVersions.map((v: "MV2" | "MV3") => (
          <li
            data-selected={manifestVersion === v ? "true" : undefined}
            onClick={() => setStateWithConfirmation({ manifestVersion: v })}
          >
            {v === "MV2" ? "Manifest V2" : "Manifest V3"}
          </li>
        ))}
      </ul>
      <h2>Settings</h2>
      <ul>
        <li
          onClick={() =>
            setPlaygroundState({
              ...playgroundState,
              includePolyfill: !playgroundState.includePolyfill,
            })
          }
        >
          Include browser polyfill{" "}
          {playgroundState.includePolyfill ? (
            <BsCheckCircleFill className={styles.filled} />
          ) : (
            <BsCheckCircle />
          )}
        </li>
        <li
          onClick={() =>
            setPlaygroundState({
              ...playgroundState,
              theme: playgroundState.theme === "Light" ? "Dark" : "Light",
            })
          }
        >
          Dark theme{" "}
          {playgroundState.theme === "Dark" ? (
            <BsMoonFill className={styles.filled} />
          ) : (
            <BsMoon />
          )}
        </li>
      </ul>
    </div>
  );
}
