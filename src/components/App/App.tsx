import { Editor } from "../Editor/Editor";
import { Sidebar } from "../Sidebar/Sidebar";
import styles from "./App.scss";

export function App() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <Editor />
    </div>
  );
}
