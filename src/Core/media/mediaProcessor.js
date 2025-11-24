import { Platform } from 'react-native'
import * as _ from 'lodash'
import RNFS from 'react-native-fs'
import ImageResizer from 'react-native-image-resizer'
import 'react-native-get-random-values'
import { v4 as uuid } from 'uuid'

const BASE_DIR = `${RNFS.CachesDirectoryPath}/expo-cache/`

// Checks if given directory exists. If not, creates it
async function ensureDirExists(givenDir) {
  const exists = await RNFS.exists(givenDir)
  if (!exists) {
    await RNFS.mkdir(givenDir)
  }
}

export const downloadFile = async (file, fileName) => {
  try {
    await ensureDirExists(BASE_DIR)
    const fileUri = `${BASE_DIR}${fileName}`
    const exists = await RNFS.exists(fileUri)

    if (exists) {
      return { uri: Platform.OS === 'android' ? `file://${fileUri}` : fileUri }
    }

    const downloadResult = await RNFS.downloadFile({
      fromUrl: file,
      toFile: fileUri,
    }).promise

    if (downloadResult.statusCode === 200) {
      return { uri: Platform.OS === 'android' ? `file://${fileUri}` : fileUri }
    }

    return { uri: null }
  } catch (error) {
    console.error('Download error:', error)
    return { uri: null }
  }
}

const resizeImage = async ({ image }, callback) => {
  const imagePath = image?.path || image?.uri

  try {
    const resizedImage = await ImageResizer.createResizedImage(
      imagePath,
      2000,
      2000,
      'JPEG',
      70,
      0,
    )
    callback(resizedImage.uri)
  } catch (err) {
    console.error('Image resize error:', err)
    callback(imagePath)
  }
}

/**
 * This function takes a media file object as the first argument and callback function as the second argument.
 * The media file object can either be a photo object or a video object.
 * If the media file is a photo object, this function resizes the photo and calls the callback function with an object of a processed uri.
 * If the media file is a video object, this function compresses the video file and creates a thumbnail from the compressed file. Then
 * calls the callback function with an object of a processed uri and thumbnail uri.
 * @param {object} file
 * @param {function} callback
 */
export const processMediaFile = (file, callback) => {
  const { type, uri, path } = file
  const fileSource = uri || path

  const includesImage = type?.includes('image')
  if (includesImage) {
    resizeImage({ image: file }, processedUri => {
      callback({ processedUri })
    })
    return
  }
  callback({ processedUri: fileSource })
}
