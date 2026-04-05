import { BaseEdge, getBezierPath } from 'reactflow'

export default function SolidEdge(props) {
  const [path] = getBezierPath(props)
  return <BaseEdge path={path} style={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5 }} />
}
