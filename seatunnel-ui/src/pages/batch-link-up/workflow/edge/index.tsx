// CustomEdge.tsx
import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 如果 style 中已经有 stroke 属性（来自 onNodeMouseEnter），就使用它
  // 否则根据状态返回颜色
  const strokeColor =
    style.stroke ||
    (data?.executionStatus === 'running'
      ? '#faad14'
      : data?.executionStatus === 'succeeded'
      ? '#17b26a'
      : data?.executionStatus === 'failed'
      ? '#ff4d4f'
      : data?.executionStatus === 'pending'
      ? '#296dff'
      : '#d0d5dc');



  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: style.strokeWidth || 1.5,
        }}
      />
    </>
  );
};

export default CustomEdge;
