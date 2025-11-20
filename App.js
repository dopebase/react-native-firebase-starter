import React, { useEffect } from 'react'
import { LogBox } from 'react-native'
import { Provider } from 'react-redux'
import SplashScreen from 'react-native-splash-screen'
import { MenuProvider } from 'react-native-popup-menu'
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
  const theme = extendTheme(InstamobileTheme)

  useEffect(() => {
    SplashScreen.hide()
    LogBox.ignoreAllLogs(true)
  }, [])
  return (
    <Provider store={store}>
      <TranslationProvider translations={translations}>
        <DopebaseProvider theme={theme}>
          <ConfigProvider>
            <AuthProvider authManager={authManager}>
              <MenuProvider>
                <ActionSheetProvider>
                  <AppContent />
                </ActionSheetProvider>
              </MenuProvider>
            </AuthProvider>
          </ConfigProvider>
        </DopebaseProvider>
      </TranslationProvider>
    </Provider>
  )
}

export default App
