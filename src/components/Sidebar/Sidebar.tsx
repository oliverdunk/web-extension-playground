import styles from "./Sidebar.scss";

export function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <h1>WebExtension Playground</h1>
      <h2>Templates</h2>
      <ul>
        <li>Hello World</li>
        <li data-selected>New Tab Page</li>
        <li>Text Replacer</li>
        <li>Ad Blocker</li>
      </ul>
      <h2>Browsers</h2>
      <ul>
        <li data-selected>Chrome</li>
        <li>Firefox</li>
        <li>Safari</li>
      </ul>
    </div>
  );
}
