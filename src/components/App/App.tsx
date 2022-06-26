import { Editor } from "../Editor/Editor";
import { Sidebar } from "../Sidebar/Sidebar";
import { StateProvider } from "../StateProvider/StateProvider";
import styles from "./App.scss";

export function App() {
  return (
    <StateProvider>
      <div className={styles.app}>
        <Sidebar />
        <Editor />
      </div>
    </StateProvider>
  );
}
