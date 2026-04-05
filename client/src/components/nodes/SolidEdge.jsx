import { BaseEdge, getSmoothStepPath } from 'reactflow'

export default function SolidEdge(props) {
  const [path] = getSmoothStepPath(props)
  return <BaseEdge path={path} style={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }} />
}
