import Link from 'next/link';
import styles from './MenuButton.module.css';

export default function MenuButton({ href, children, 'data-testid': testId }) {
  return (
    <Link href={href} className={styles.btn} data-testid={testId ?? undefined}>
      <span className={styles.dashesTop} aria-hidden />
      <span className={styles.label}>{children}</span>
      <span className={styles.dashesBottom} aria-hidden />
    </Link>
  );
}
