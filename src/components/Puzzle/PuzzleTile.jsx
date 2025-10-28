import styles from './SlidingPuzzle.module.css';
import { MOVABLE_TILE_BORDER_COLOR } from './puzzle-constants';
import { shouldShowHorizontalOp, shouldShowVerticalOp, getOperatorIndex } from './puzzle-utils';

export default function PuzzleTile({
  tile,
  rowIndex,
  colIndex,
  N,
  operators,
  isMovable,
  isDragging,
  onTileClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) {
  return (
    <div
      className={`${styles.tile} ${tile === null ? styles.emptyTile : ''} ${
        isMovable ? styles.movableTile : ''
      } ${isDragging ? styles.draggingTile : ''}`}
      onClick={() => onTileClick(rowIndex, colIndex)}
      draggable={tile !== null && isMovable}
      onDragStart={(e) => onDragStart(e, rowIndex, colIndex)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, rowIndex, colIndex)}
      style={isMovable && tile !== null ? {
        '--movable-border-color': MOVABLE_TILE_BORDER_COLOR
      } : {}}
    >
      <span className={styles.tileNumber}>{tile}</span>
      
      {/* Right operator */}
      {shouldShowHorizontalOp(rowIndex, colIndex, N) && (
        <div className={styles.horizontalOp}>
          <span className={styles.opSymbol}>
            {operators[getOperatorIndex(rowIndex, colIndex, true, N)] || ''}
          </span>
        </div>
      )}
      
      {/* Bottom operator */}
      {shouldShowVerticalOp(rowIndex, colIndex, N) && (
        <div className={styles.verticalOp}>
          <span className={styles.opSymbol}>
            {operators[getOperatorIndex(rowIndex, colIndex, false, N)] || ''}
          </span>
        </div>
      )}
    </div>
  );
}