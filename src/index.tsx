import { createRoot } from "react-dom/client";
import { App } from "./components/App/App";

const app = document.getElementById("app");
const root = createRoot(app!);
root.render(<App />);
