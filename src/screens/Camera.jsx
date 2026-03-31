import CameraPlayer from '../components/CameraPlayer'

export default function Camera() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>
      <h2>Live Camera View (Web)</h2>
      <CameraPlayer />
    </div>
  )
}
