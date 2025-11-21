// Stub for useGoogleAuth - requires expo-auth-session setup
// For production use, implement with @react-native-google-signin/google-signin (already installed)
export const useGoogleAuth = () => {
  console.warn('Google auth via expo-auth-session not configured - use @react-native-google-signin/google-signin instead')

  return {
    request: null,
    response: null,
    promptAsync: async () => {
      console.warn('Google auth via expo-auth-session not available')
      return { type: 'error', error: 'Not configured' }
    },
  }
}
