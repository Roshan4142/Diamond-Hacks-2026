import { BaseEdge, getBezierPath } from 'reactflow'

export default function DashedEdge(props) {
  const [path] = getBezierPath(props)
  return <BaseEdge path={path} style={{ stroke: 'rgba(124,92,191,0.7)', strokeWidth: 1.5, strokeDasharray: '6,4' }} />
}
