// Mobile/web stub for expo-camera used during web builds where actual native APIs are unavailable.
// This file is also used by mobile Vite web builds via alias.

export const Camera = {
  Constants: {
    Type: {
      back: 'back',
      front: 'front',
    },
  },
  requestCameraPermissionsAsync: async () => ({ status: 'denied' }),
  getAvailableCameraTypesAsync: async () => [],
  takePictureAsync: async () => ({ uri: '' }),
  recordAsync: async () => ({}),
  pausePreview: async () => ({}),
  resumePreview: async () => ({}),
}
