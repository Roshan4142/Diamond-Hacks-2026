import { BaseEdge, getBezierPath } from 'reactflow'

export default function DashedEdge(props) {
  const [path] = getBezierPath(props)
  return <BaseEdge path={path} className="ghost-connection" />
}
