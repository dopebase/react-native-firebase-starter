import React from 'react'
import {
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native'
import Modal from 'react-native-modal'
import styles from './styles'

const { width, height } = Dimensions.get('window')
const swipeArea = Math.floor(height * 0.2)
const circleSnailProps = { thickness: 1, color: '#ddd', size: 80 }

export class MediaViewerModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      heights: {
        default: Math.floor(height * 0.6),
      },
    }
    this.imageLoading = false
    this.imageDoneLoading = false
    this.mediaLayouts = []
    this.scrollviewRef = React.createRef()
  }

  onScrollView = scrollviewRef => {
    setTimeout(() => {
      if (scrollviewRef) {
        scrollviewRef.scrollTo({
          y: 0,
          x: this.mediaLayouts[this.props.selectedMediaIndex],
          animated: false,
        })
      }
    }, 500)
  }

  onImageLoad = (evt, uri) => {
    const { heights } = this.state
    const ImageHeight =
      evt.nativeEvent?.source?.height || evt.nativeEvent?.height
    const ImageWidth = evt.nativeEvent?.source?.width || evt.nativeEvent?.width

    const newHeight = Math.floor((ImageHeight / ImageWidth) * width)

    if (newHeight) {
      this.setState({
        heights: { ...heights, [uri]: newHeight },
      })
    }
  }

  renderCloseButton() {
    return (
      <TouchableOpacity
        style={styles.closeButton}
        onPress={this.props.onClosed}>
        <View
          style={[styles.closeCross, { transform: [{ rotate: '45deg' }] }]}
        />
        <View
          style={[styles.closeCross, { transform: [{ rotate: '-45deg' }] }]}
        />
      </TouchableOpacity>
    )
  }

  render() {
    const { isModalOpen, onClosed } = this.props
    const { heights } = this.state

    return (
      <Modal
        style={styles.container}
        isVisible={isModalOpen}
        onBackdropPress={onClosed}
        onBackButtonPress={onClosed}
        onSwipeComplete={onClosed}
        swipeDirection={['down']}
        propagateSwipe={true}
        useNativeDriver={Platform.OS === 'android' ? true : false}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={500}
        coverScreen={true}>
        {this.renderCloseButton()}
        <ScrollView
          ref={this.onScrollView}
          style={{ height: '100%', width: '100%' }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}>
          {this.props.mediaItems.length > 0 &&
            this.props.mediaItems.map((uri, index) => (
              <View
                key={index}
                style={styles.container}
                onLayout={event => {
                  const layout = event.nativeEvent.layout
                  this.mediaLayouts[index] = layout.x || layout.left
                }}>
                {uri && (
                  <Image
                    source={{
                      uri,
                    }}
                    style={[
                      styles.deck,
                      { height: heights[uri] || heights['default'] },
                    ]}
                    indicatorProps={circleSnailProps}
                    resizeMode={'contain'}
                    onLoad={e => this.onImageLoad(e, uri)}
                  />
                )}
              </View>
            ))}
        </ScrollView>
      </Modal>
    )
  }
}
