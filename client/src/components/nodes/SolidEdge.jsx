import { BaseEdge, getBezierPath } from 'reactflow'

export default function SolidEdge(props) {
  const [path] = getBezierPath(props)
  return <BaseEdge path={path} className="connection-curve" />
}
