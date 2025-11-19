import styles from './SlidingPuzzle.module.css';

export default function PuzzleHeader({ N, onNChange }) {
  return (
    <div className={styles.header}>
      <div className={styles.sizeSelector}>
        <button 
          className={`${styles.sizeButton} ${N === 3 ? styles.active : ''}`}
          onClick={() => onNChange(3)}
        >
          3×3
        </button>

        <button 
          className={`${styles.sizeButton} ${N === 4 ? styles.active : ''}`}
          onClick={() => onNChange(4)}
        >
          4×4
        </button>

        
        <button 
          className={`${styles.sizeButton} ${N === 5 ? styles.active : ''}`}
          onClick={() => onNChange(5)}
        >
          5×5
        </button>
      </div>
    </div>
  );
}
