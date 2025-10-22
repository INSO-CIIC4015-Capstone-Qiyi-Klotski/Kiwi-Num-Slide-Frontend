'use client';

import { useState } from 'react';
import styles from './Board.module.css';

const SIZE = 4;

export default function Board() {
  const [tiles, setTiles] = useState(() =>
    Array.from({ length: SIZE * SIZE }, (_, i) => i + 1).map((n) =>
      n === SIZE * SIZE ? 0 : n
    )
  );

  function handleDragStart(e, from) {
    e.dataTransfer.setData('text/plain', String(from));
  }

  function handleDrop(e, to) {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from)) return;

    setTiles((prev) => {
      const next = [...prev];
      const tmp = next[from];
      next[from] = next[to];
      next[to] = tmp;
      return next;
    });
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  return (
    <div className={styles.board}>
      {tiles.map((v, idx) => (
        <div
          key={idx}
          className={v === 0 ? styles.empty : styles.tile}
          draggable={v !== 0}
          onDragStart={(e) => v !== 0 && handleDragStart(e, idx)}
          onDragOver={allowDrop}
          onDrop={(e) => handleDrop(e, idx)}
        >
          {v !== 0 ? v : ''}
        </div>
      ))}
    </div>
  );
}
