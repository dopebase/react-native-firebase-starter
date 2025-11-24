import React, { useCallback, useLayoutEffect } from 'react'
import { View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/core'
import deviceStorage from '../../utils/AuthDeviceStorage'
import { useDispatch } from 'react-redux'
import { setUserData } from '../../redux/auth'
import { useOnboardingConfig } from '../../hooks/useOnboardingConfig'
import { useAuth } from '../../hooks/useAuth'

const LoadScreen = () => {
  const navigation = useNavigation()

  const dispatch = useDispatch()
  const authManager = useAuth()

  const { config } = useOnboardingConfig()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  useFocusEffect(
    useCallback(() => {
      setAppState()
    }, []),
  )

  const setAppState = async () => {
    console.log('LoadScreen: setAppState started')
    const shouldShowOnboardingFlow =
      await deviceStorage.getShouldShowOnboardingFlow()
    console.log('LoadScreen: shouldShowOnboardingFlow', shouldShowOnboardingFlow)
    if (!shouldShowOnboardingFlow) {
      if (config?.isDelayedLoginEnabled) {
        fetchPersistedUserIfNeeded()
        return
      }
      navigation.navigate('LoginStack')
    } else {
      navigation.navigate('Walkthrough')
    }
  }

  const fetchPersistedUserIfNeeded = async () => {
    if (!authManager?.retrievePersistedAuthUser) {
      return navigation.navigate('DelayedHome')
    }
    authManager
      ?.retrievePersistedAuthUser(config)
      .then(response => {
        if (response?.user) {
          dispatch(
            setUserData({
              user: response.user,
            }),
          )
          Keyboard.dismiss()
        }
        navigation.navigate('DelayedHome')
      })
      .catch(error => {
        console.log(error)
        navigation.navigate('DelayedHome')
      })
  }
  return <View />
}

export default LoadScreen
