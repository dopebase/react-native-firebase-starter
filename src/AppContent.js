import React from 'react'
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import RootNavigator from './navigators/RootNavigator'
import { OnboardingConfigProvider } from './Core/onboarding/hooks/useOnboardingConfig'
import { useConfig } from './config'

export default AppContent = () => {
  const config = useConfig()

  return (
    <OnboardingConfigProvider config={config}>
      <StatusBar />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </OnboardingConfigProvider>
  )
}
