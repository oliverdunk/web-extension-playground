import { createRoot } from "react-dom/client";
import { App } from "./components/App/App";

import Modal from "react-modal";

// @ts-expect-error React modal seems to think it can't use the DOM, so
// we override that property to allow it to run
import * as safeHtmlElement from "react-modal/lib/helpers/safeHTMLElement";
safeHtmlElement.canUseDOM = true;

const app = document.getElementById("app");
Modal.setAppElement("#app");

const root = createRoot(app!);
root.render(<App />);
