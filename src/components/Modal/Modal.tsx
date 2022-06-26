import ReactModal from "react-modal";
import styles from "./Modal.scss";

export function Modal(props: ReactModal["props"]) {
  return <ReactModal className={styles.modal} {...props} />;
}
