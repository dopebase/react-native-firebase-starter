// Stub for useFacebookAuth - requires expo-auth-session setup
// For production use, implement with react-native-fbsdk-next or similar
export const useFacebookAuth = () => {
  console.warn('Facebook auth not configured - requires expo-auth-session or react-native-fbsdk-next')

  return {
    request: null,
    response: null,
    promptAsync: async () => {
      console.warn('Facebook auth not available')
      return { type: 'error', error: 'Not configured' }
    },
  }
}
