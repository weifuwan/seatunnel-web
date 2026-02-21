import {
  memo,
  useMemo,
} from 'react'
import type { NodeProps } from 'reactflow'
import { BlockEnum, NodeComponentMap } from './constants'
import { message } from 'antd'

const CustomNode = (props: NodeProps) => {


  const nodeData = props.data

  if(!nodeData?.nodeType) {
    message.error("nodeData is null")
    return;
  }

  const NodeComponent = NodeComponentMap[nodeData.nodeType]

  return (
    <>
      <div>
        <NodeComponent { ...props }/>
      </div>
    </>
  )
}

export default CustomNode
