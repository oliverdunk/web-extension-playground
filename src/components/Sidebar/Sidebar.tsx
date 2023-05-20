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
import { Modal } from "../Modal/Modal";

export function Sidebar() {
  const { playgroundState, setPlaygroundState } = useContext(PlaygroundContext);
  const { selectedTemplate, selectedBrowser, manifestVersion } =
    playgroundState;

  const [showingMobileMenu, setShowingMobileMenu] = useState(false);
  const [showingAboutModal, setShowingAboutModal] = useState(false);
  const [showingMobileModal, setShowingMobileModal] = useState(
    "ontouchstart" in document.documentElement &&
      !localStorage.getItem("mobile-warning-shown")
  );

  function setStateWithConfirmation(newState: Partial<PlaygroundState>) {
    if (
      !playgroundState.hasEditedModel ||
      window.confirm(
        "Changing the editor settings will regenerate the project and overwrite any file changes. Continue?"
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
  const manifestVersions: ManifestVersion[] = ["MV3", "MV2"];

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
      <div className={styles.menu}>
        <h2>Templates</h2>
        <ul>
          {templates.map((t) => (
            <li
              data-disabled={t.filter?.(playgroundState) === false}
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
              data-disabled={selectedTemplate.filter?.({ ...playgroundState, selectedBrowser: b }) === false}
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
              setStateWithConfirmation({
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
        <div className={styles.about}>
          <a onClick={() => setShowingAboutModal(true)}>About</a>
        </div>
      </div>
      {/* prettier-ignore */}
      <Modal isOpen={showingAboutModal} onRequestClose={() => setShowingAboutModal(false)}>
        <h1>About</h1>
        <p>
          This is an open source project by <a href="https://twitter.com/oliverdunk_" target="_blank">Oliver Dunk</a>. The source code is available on <a href="https://github.com/oliverdunk/web-extension-playground" target="_blank">GitHub</a>.
        </p>
        <p></p>
        <p>
          The playground is built with many open source projects including{" "}
          <a href="https://github.com/facebook/react" target="_blank">React</a>,{" "}
          <a href="https://github.com/react-icons/react-icons" target="_blank">react-icons</a>,{" "}
          <a href="https://github.com/twbs/icons" target="_blank">Bootstrap Icons</a>,{" "}
          <a href="https://github.com/reactjs/react-modal" target="_blank">react-modal</a>,{" "}
          <a href="https://github.com/Stuk/jszip" target="_blank">js-zip</a>, and the{" "}
          <a href="https://github.com/microsoft/monaco-editor" target="_blank">Monaco editor</a>
          .
        </p>
        <p>Extension types are vendored from <a href="https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/chrome" target="_blank">@types/chrome</a> and <a href="https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/webextension-polyfill" target="_blank">@types/webextension-polyfill</a>.</p>
        <p>webextension-polyfill is available <a href="https://github.com/mozilla/webextension-polyfill" target="_blank">on GitHub</a>.</p>
      </Modal>
      <Modal
        isOpen={showingMobileModal}
        onRequestClose={() => {
          setShowingMobileModal(false);
          localStorage.setItem("mobile-warning-shown", "true");
        }}
      >
        <h1>Better on desktop</h1>
        <p>
          Mobile support was an important consideration when building this site,
          and it should work fairly well. That said, code editing really is
          better served on desktop. Do try loading this site there if you get a
          chance!
        </p>
        <button
          type="submit"
          onClick={() => {
            setShowingMobileModal(false);
            localStorage.setItem("mobile-warning-shown", "true");
          }}
        >
          Ok
        </button>
      </Modal>
    </div>
  );
}
