import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { useTheme, useTranslations } from '../../../core'
import dynamicStyles from './styles'

export const ImagePicker = ({
  title,
  value,
  allowsMultipleSelection = false,
  handleImages = () => { },
}) => {
  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)
  const [image, setImage] = useState(value)

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: allowsMultipleSelection ? 0 : 1,
      quality: 1,
    }

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage)
      } else if (response.assets && response.assets.length > 0) {
        const result = allowsMultipleSelection
          ? { selected: response.assets }
          : response.assets[0]
        handleImages(result)
        setImage(result)
      }
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{localized(title)}</Text>
      </View>
      {image && (
        <Image
          source={{
            uri: image?.downloadURL || image?.uri,
          }}
          style={styles.image}
        />
      )}
      <View
        style={[
          styles.uploadImageBtnContainer,
          image ? { marginTop: 16 } : {},
        ]}>
        <TouchableOpacity
          style={styles.uploadImageBtn}
          onPress={() => pickImage()}>
          <Text style={styles.uploadImageText}>
            {localized('Upload Image')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
