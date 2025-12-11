'use client';

import { useState } from 'react';
import styles from './TutorialButton.module.css';
import TutorialBoard from './TutorialBoard';

export default function TutorialButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        className={styles.tutorialButton} 
        aria-label="How to Play"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
        <span>How to Play</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton} 
              onClick={() => setIsOpen(false)}
              aria-label="Close tutorial"
            >
              ×
            </button>
            
            <h2 className={styles.modalTitle}>How to Play</h2>
            
            <div className={styles.content}>
              {/* Visual Example Board */}
              <TutorialBoard />

              {/* Instructions */}
              <div className={styles.instructions}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Understand the Grid</h3>
                    <p>Each row and column forms an arithmetic expression like <code>3 − 4 + 6</code>. The numbers on the edges show the <strong>target result</strong> for that row or column.</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>Slide the Tiles</h3>
                    <p>Click or use arrow keys to slide tiles into the empty space. Tiles can only move into adjacent empty spots.</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Match All Targets</h3>
                    <p>Rearrange tiles so every row and column evaluates to its target value. When all match, you win! 🎉</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>💡</div>
                  <div className={styles.stepContent}>
                    <h3>Tips</h3>
                    <ul>
                      <li>Operations follow PEMDAS.</li>
                      <li>Start by focusing on one row or column at a time.</li>
                      <li>If you feel lost, do the arithmetic on paper.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className={styles.gotItButton}
              onClick={() => setIsOpen(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

