import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FaGripVertical } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Box } from '@mui/material';

// ドラッグ時の行並べ替え用コンポーネント
const DraggableRow = ({ type, index, moveRow, handleContextMenu }) => {
  const ref = useRef(null);
  const originalIndexRef = useRef(null);  // 追加: 元の位置を保持

  const [{ isDragging }, drag] = useDrag({
      type: 'ROW',
      item: () => {
          originalIndexRef.current = index;  // ドラッグ開始時の位置を保存
          return { index };
      },
      collect: (monitor) => ({
          isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
          // ドラッグ終了時に元の位置と最終位置が異なる場合のみmoveRowを呼び出す
          const didDrop = monitor.didDrop();
          if (didDrop && originalIndexRef.current !== item.index) {
              moveRow(originalIndexRef.current, item.index);
          }
      }
  });

  const [, drop] = useDrop({
      accept: 'ROW',
      hover: (draggedItem, monitor) => {
          if (!ref.current) {
              return;
          }

          const dragIndex = draggedItem.index;
          const hoverIndex = index;

          if (dragIndex === hoverIndex) {
              return;
          }

          const hoverBoundingRect = ref.current.getBoundingClientRect();
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const clientOffset = monitor.getClientOffset();
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;

          if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
              return;
          }
          if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
              return;
          }

          // ドラッグ中はindexの更新のみ行う
          draggedItem.index = hoverIndex;
      }
  });

  drag(drop(ref));

  return (
      <TableRow
          ref={ref}
          onContextMenu={(event) => handleContextMenu(event, type.id)}
          sx={{
              opacity: isDragging ? 0.5 : 1,
              cursor: 'move',
              '&:hover': {
                  backgroundColor: '#f5f5f5',
                  '& .drag-handle': {
                      opacity: 1
                  }
              }
          }}
      >
          <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FaGripVertical
                      className="drag-handle"
                      size={16}
                      style={{
                          opacity: 0.3,
                          transition: 'opacity 0.2s',
                          color: '#666'
                      }}
                  />
                  {type.name}
              </Box>
          </TableCell>
      </TableRow>
  );
};

DraggableRow.propTypes = {
  type: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  moveRow: PropTypes.func.isRequired,
  handleContextMenu: PropTypes.func.isRequired,
};

export default DraggableRow;