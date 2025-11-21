import React, { useEffect } from 'react'
import { LogBox } from 'react-native'
import { Provider } from 'react-redux'


import {
  DopebaseProvider,
  extendTheme,
  TranslationProvider,
  ActionSheetProvider,
} from './src/Core/dopebase'
import configureStore from './src/redux/store'
import AppContent from './src/AppContent'
import translations from './src/translations/'
import { ConfigProvider } from './src/config'
import { AuthProvider } from './src/Core/onboarding/hooks/useAuth'
import { authManager } from './src/Core/onboarding/api'
import InstamobileTheme from './src/theme'

const store = configureStore()

const App = () => {
  console.log('App.tsx: authManager is', authManager)
  const theme = extendTheme(InstamobileTheme)

  useEffect(() => {
    LogBox.ignoreAllLogs(true)
  }, [])
  return (
    <Provider store={store}>
      <TranslationProvider translations={translations}>
        <DopebaseProvider theme={theme}>
          <ConfigProvider>
            <AuthProvider authManager={authManager || {}}>
              <ActionSheetProvider>
                <AppContent />
              </ActionSheetProvider>
            </AuthProvider>
          </ConfigProvider>
        </DopebaseProvider>
      </TranslationProvider>
    </Provider>
  )
}

export default App
