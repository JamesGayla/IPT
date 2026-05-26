import { useEffect, useState, useRef } from 'react'

const LOCAL_VIDEO_PATH = '/Mockup%20Camera.mp4'

export default function CameraPlayer({ initialUrl = LOCAL_VIDEO_PATH, hideControls = false, onVideoEvent }) {
  const externalUrl = initialUrl
  const useWebcam = externalUrl === 'webcam'
  const isMjpegStream = !useWebcam && /mjpeg|\.mjpg|\/video/i.test(externalUrl)
  const isVideoStream = !useWebcam && (externalUrl.match(/\.(mp4)$/i) || externalUrl.includes('youtube.com') || externalUrl.includes('youtu.be') || externalUrl.includes('m3u8'))
  const sourceLabel = useWebcam ? 'Browser camera stream' : externalUrl.startsWith('http') ? 'Live camera stream' : 'Mockup Camera (local stream)'
  const [currentUrl, setCurrentUrl] = useState(() => `${externalUrl.split('?')[0]}?t=${Date.now()}`)
  const [playerState, setPlayerState] = useState('loading') // loading|playing|ended|error
  const [mediaError, setMediaError] = useState('')
  const videoRef = useRef(null)

  useEffect(() => {
    if (!useWebcam) {
      setCurrentUrl(`${externalUrl.split('?')[0]}?t=${Date.now()}`)
    }
  }, [externalUrl, useWebcam])

  useEffect(() => {
    if (!useWebcam) {
      return
    }

    let activeStream = null
    const startWebcam = async () => {
      setPlayerState('loading')
      setMediaError('')
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser does not support camera access')
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        activeStream = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setPlayerState('playing')
        if (onVideoEvent) onVideoEvent('stream')
      } catch (error) {
        console.error('Camera access error:', error)
        setMediaError('Unable to access camera. Please allow camera permission or use a supported browser.')
        setPlayerState('error')
      }
    }

    startWebcam()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [useWebcam, onVideoEvent])

  const resetVideo = () => {
    if (useWebcam) {
      return
    }

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
      <div style={{ padding: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
        <div style={{ marginBottom: 6, fontWeight: 600, color: 'var(--text-primary)' }}>Camera source</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ flex: 1, color: 'var(--text-primary)' }}>{sourceLabel}</span>
          <button onClick={() => resetVideo()} style={{ padding: '10px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
        {useWebcam ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={!hideControls}
              style={{ width: '100%', height: '400px', objectFit: 'cover', background: '#000' }}
            />
            {mediaError && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 16, textAlign: 'center' }}>
                {mediaError}
              </div>
            )}
          </>
        ) : isVideoStream ? (
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
        ) : isMjpegStream ? (
          <img
            key={currentUrl}
            src={currentUrl}
            alt="Live camera stream"
            style={{ width: '100%', height: 400, objectFit: 'cover', background: '#000' }}
          />
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
          {playerState === 'error' && 'Camera error'}
        </div>
      </div>
    </section>
  )
}
