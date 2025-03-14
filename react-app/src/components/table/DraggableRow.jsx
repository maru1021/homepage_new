import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Box } from '@mui/material';
import tableSort from '../../utils/tableSort';


// ドラッグ時の行並べ替え用コンポーネント
const DraggableRow = ({ url, data, index, handleContextMenu, allData }) => {
    const ref = useRef(null);
    const originalIndexRef = useRef(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'ROW',
        item: () => {
            originalIndexRef.current = index;
            return { index, allData };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const didDrop = monitor.didDrop();
            if (didDrop && originalIndexRef.current !== item.index) {
                tableSort(url, item.allData, originalIndexRef.current, item.index);
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

    // 表示から除外するフィールド
    const excludeFields = ['sort', 'id', 'created_at', 'updated_at'];

    // dataオブジェクトから表示用のプロパティを取得
    const displayData = Object.entries(data).filter(([key]) => {
        // 除外フィールドに含まれていない、_id"で終わらないフィールドのみを表示
        return !excludeFields.includes(key) && !key.endsWith('_id');
    });

    return (
        <TableRow
            ref={ref}
            onContextMenu={(event) => handleContextMenu(event, data.id)}
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
            {/* dataのすべてのプロパティを表示 */}
            {displayData.map(([key, value]) => (
                <TableCell key={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {value}
                    </Box>
                </TableCell>
            ))}
        </TableRow>
    );
};

DraggableRow.propTypes = {
    url: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    handleContextMenu: PropTypes.func.isRequired,
    allData: PropTypes.array.isRequired,
};

export default DraggableRow;