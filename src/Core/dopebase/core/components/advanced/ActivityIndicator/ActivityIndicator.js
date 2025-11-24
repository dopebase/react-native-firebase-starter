import React, { memo } from 'react'
import { View, Text, ActivityIndicator as RNActivityIndicator } from 'react-native'
import { useTheme } from '../../..'
import dynamicStyles from './styles'

export const ActivityIndicator = memo(props => {
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)
  return (
    <View style={styles.container}>
      <View style={styles.indicatorContainer}>
        <RNActivityIndicator
          color="#f5f5f5"
          size="large"
        />
        {props.text && props.text.length > 1 ? (
          <Text>{props.text}</Text>
        ) : (
          <View />
        )}
      </View>
    </View>
  )
})
