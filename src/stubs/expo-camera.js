// Web stub for expo-camera (used only in mixed mobile/web monorepo builds)
// This avoids Vite throwing import resolution errors when mobile-only files exist.

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
}
