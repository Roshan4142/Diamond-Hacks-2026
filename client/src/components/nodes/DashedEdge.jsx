import { BaseEdge, getSmoothStepPath } from 'reactflow'

export default function DashedEdge(props) {
  const [path] = getSmoothStepPath(props)
  return <BaseEdge path={path} style={{ stroke: 'rgba(124,92,191,0.6)', strokeWidth: 1, strokeDasharray: '5,5' }} />
}
