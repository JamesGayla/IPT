import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Camera } from 'expo-camera'

export default function MobileCameraScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [photoUri, setPhotoUri] = useState(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No access to camera. Use mock image below.</Text>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1571607385758-c14c7dab9b41?auto=format&fit=crop&w=1600&q=80' }} style={styles.mockImage} />
      </View>
    )
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false })
      setPhotoUri(photo.uri)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Lot Camera</Text>
      <Text style={styles.subtitle}>Live feed (or mock) for mobile proof-of-concept.</Text>

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.cameraView}
          type={Camera.Constants.Type.back}
          onCameraReady={() => setIsReady(true)}
        />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button} onPress={takePicture} disabled={!isReady}>
          <Text style={styles.buttonText}>{isReady ? 'Capture Snapshot' : 'Camera starting...'}</Text>
        </TouchableOpacity>
      </View>

      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}

      <Text style={styles.tip}>If camera access is not available on your browser or device emulator, preview the mock image above.</Text>

      <Image source={{ uri: 'https://images.unsplash.com/photo-1571607385758-c14c7dab9b41?auto=format&fit=crop&w=1600&q=80' }} style={styles.mockImage} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7fafc'
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, color: '#1f2937' },
  subtitle: { marginBottom: 12, color: '#4b5563' },
  cameraContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 280,
    marginBottom: 12,
    backgroundColor: '#000'
  },
  cameraView: { flex: 1 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  button: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover'
  },
  tip: { color: '#6b7280', marginBottom: 10 },
  mockImage: {
    width: '100%',
    height: 180,
    borderRadius: 12
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }
})
