import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme, useTranslations } from '../../..'
import dynamicStyles from './styles'

// Stub for DocumentPicker - requires compatible document picker library
// For production use, install a React Native 0.82 compatible document picker
export const DocumentPicker = ({ title, handleDocument = () => { } }) => {
  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)
  const [document, setDocument] = useState()

  const pickDocument = async () => {
    console.warn('Document picker not configured - requires React Native 0.82 compatible library')
    alert('Document picker is not available in this build')
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{localized(title)}</Text>
      </View>
      <View style={styles.uploadDocumentBtnContainer}>
        <TouchableOpacity
          style={[
            styles.uploadDocumentBtn,
            document && {
              borderColor: '#51DC83FF',
            },
          ]}
          onPress={() => pickDocument()}>
          <Text
            style={[
              styles.uploadDocumentText,
              document && { color: '#51DC83FF' },
            ]}>
            {localized('Choose File')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
