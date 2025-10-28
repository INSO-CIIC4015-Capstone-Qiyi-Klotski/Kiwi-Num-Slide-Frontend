import styles from './StaticGrid.module.css';

export default function StaticGrid({ numbers, label, orientation = 'vertical' }) {
  return (
    <div className={styles.staticGridContainer}>
      {label && <div className={styles.label}>{label}</div>}
      <div 
        className={styles.staticGrid}
        data-orientation={orientation}
      >
        {numbers.map((num, index) => (
          <div 
            key={`static-${index}`} 
            className={`${styles.staticCell} ${num === null ? styles.emptyCell : ''}`}
          >
            {num !== null && <span className={styles.cellNumber}>{num}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}