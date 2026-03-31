import { useEffect, useState } from 'react'

const LOCAL_VIDEO_PATH = '/Mockup%20Camera.mp4'

export default function CameraPlayer({ initialUrl = LOCAL_VIDEO_PATH, hideControls = false, onVideoEvent }) {
  const externalUrl = initialUrl
  const [currentUrl, setCurrentUrl] = useState(() => `${externalUrl}?t=${Date.now()}`)
  const [playerState, setPlayerState] = useState('loading') // loading|playing|ended

  useEffect(() => {
    setCurrentUrl(`${externalUrl.split('?')[0]}?t=${Date.now()}`)
  }, [externalUrl])

  const resetVideo = () => {
    const updatedUrl = `${externalUrl.split('?')[0]}?t=${Date.now()}`
    setCurrentUrl(updatedUrl)
    setPlayerState('loading')
    if (onVideoEvent) onVideoEvent('reset')
  }

  const handleEnded = () => {
    setPlayerState('ended')
    if (onVideoEvent) onVideoEvent('ended')
    resetVideo()
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ padding: 12, background: '#f4f6f8', border: '1px solid #dbe2e8', borderRadius: 8 }}>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>Camera source</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ flex: 1, color: '#374151' }}>Mockup Camera (local stream)</span>
          <button onClick={() => resetVideo()} style={{ padding: '10px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
        {(externalUrl.match(/\.(mp4)$/i) || externalUrl.includes('youtube.com') || externalUrl.includes('youtu.be')) ? (
          <video
            key={currentUrl}
            src={externalUrl.includes('m3u8') ? externalUrl : currentUrl}
            controls={!hideControls}
            autoPlay
            muted
            loop={false}
            playsInline
            style={{ width: '100%', height: '400px', objectFit: 'cover', background: '#000' }}
            onCanPlay={() => setPlayerState('playing')}
            onLoadStart={() => setPlayerState('loading')}
            onEnded={handleEnded}
          />
        ) : externalUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img src={externalUrl} alt="Camera snapshot" style={{ width: '100%', height: 400, objectFit: 'cover' }} />
        ) : (
          <iframe
            title="ExternalCamera"
            src={externalUrl}
            style={{ width: '100%', height: 400, border: 'none' }}
          />
        )}

        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>
          {playerState === 'loading' && 'Loading...'}
          {playerState === 'playing' && 'Playing'}
          {playerState === 'ended' && 'Ended - restarting'}
        </div>
      </div>
    </section>
  )
}
