import styles from './PageWrapper.module.css';

export default function PageWrapper({ children, className = '' }) {
  return (
    <section className={`${styles.wrapper} ${className}`}>
      {children}
    </section>
  );
}