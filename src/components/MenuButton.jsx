import Link from "next/link";
import styles from "./MenuButton.module.css";

export default function MenuButton({ href, children }) {
  return (
    <Link href={href} className={styles.btn}>
      <span className={styles.dashesTop} />
      <span className={styles.label}>{children}</span>
      <span className={styles.dashesBottom} />
    </Link>
  );
}
