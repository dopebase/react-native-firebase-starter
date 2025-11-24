import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Platform, NativeModules, I18nManager } from 'react-native'
import Storage from '@react-native-async-storage/async-storage'
import I18n from 'i18n-js'

export const TranslationContext = React.createContext({})

const getDeviceLocale = () => {
  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
      : NativeModules.I18nManager.localeIdentifier

  return locale?.replace(/_/, '-') || 'en-US'
}

export const TranslationProvider = ({ children, translations }) => {
  const [locale, setLocale] = useState(getDeviceLocale())

  useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = await Storage.getItem('locale')
      if (savedLocale) {
        setLocale(savedLocale)
      }
    }
    loadLocale()
  }, [])

  const localized = React.useCallback(
    (key, config) =>
      I18n.t(key, { ...config, locale }).includes('missing')
        ? key
        : I18n.t(key, { ...config, locale }),
    [locale],
  )

  const getLocale = useCallback(async () => {
    const localeJSON = await Storage.getItem('locale')
    console.log(
      `getting locale from storage and writing it to memory ${localeJSON}`,
    )

    // If we have a locale stored in local storage, that is high priority (it overrides the current device locale)
    setLocale(localeJSON !== null ? localeJSON : getDeviceLocale())
  }, [setLocale])

  useEffect(() => {
    getLocale()
  }, [getLocale])

  useEffect(() => {
    console.log(`write to storage locale: ${locale}`)
    Storage.setItem('locale', locale)
    setI18nConfig()
  }, [locale])

  const setI18nConfig = () => {
    const fallback = { languageTag: 'en' }
    I18n.translations = translations
    I18n.locale = locale
    I18n.fallbacks = true
    I18nManager.forceRTL(I18nManager.isRTL)
  }

  const value = {
    localized,
    setAppLocale: setLocale,
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}
