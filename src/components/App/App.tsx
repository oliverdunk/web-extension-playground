import { BsGithub } from "react-icons/bs";
import { Editor } from "../Editor/Editor";
import { Sidebar } from "../Sidebar/Sidebar";
import { StateProvider } from "../StateProvider/StateProvider";
import styles from "./App.scss";

export function App() {
  return (
    <StateProvider>
      <div className={styles.app}>
        <nav className={styles.docs}>
          <ul>
            <li>
              <a
                href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions"
                target="_blank"
              >
                MDN
              </a>
            </li>
            <li>
              <a
                href="https://developer.chrome.com/docs/extensions/"
                target="_blank"
              >
                Chrome Developers
              </a>
            </li>
            <li>
              <a
                href="https://developer.apple.com/documentation/safariservices/safari_web_extensions"
                target="_blank"
              >
                Apple Developer Docs
              </a>
            </li>
            <li>
              <a href="https://github.com/w3c/webextensions" target="_blank">
                WECG
              </a>
            </li>
          </ul>
          <a
            className={styles.git}
            href="https://github.com/oliverdunk/web-extension-playground"
            target="_blank"
          >
            <BsGithub /> GitHub
          </a>
        </nav>
        <div className={styles.main}>
          <Sidebar />
          <Editor />
        </div>
      </div>
    </StateProvider>
  );
}
