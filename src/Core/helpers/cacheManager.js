import * as _ from 'lodash'
import RNFS from 'react-native-fs'
import SHA1 from 'crypto-js/sha1'
import { Platform } from 'react-native'

const BASE_DIR = `${RNFS.CachesDirectoryPath}/expo-cache/`

export class CacheEntry {
  constructor(uri, options) {
    this.uri = uri
    this.options = options
  }

  async getPath() {
    const { uri } = this
    const { path, exists, tmpPath } = await getCacheEntry(uri)
    if (exists) {
      return path
    }

    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: tmpPath,
      }).promise

      // If the image download failed, we don't cache anything
      if (downloadResult.statusCode !== 200) {
        return undefined
      }

      await RNFS.moveFile(tmpPath, path)
      return path
    } catch (error) {
      console.error('Cache download error:', error)
      return undefined
    }
  }
}

export default class CacheManager {
  static entries = {}

  static get(uri, options) {
    if (!CacheManager.entries[uri]) {
      CacheManager.entries[uri] = new CacheEntry(uri, options)
    }
    return CacheManager.entries[uri]
  }

  static async clearCache() {
    const exists = await RNFS.exists(BASE_DIR)
    if (exists) {
      await RNFS.unlink(BASE_DIR)
    }
    await RNFS.mkdir(BASE_DIR)
  }

  static async getCacheSize() {
    const exists = await RNFS.exists(BASE_DIR)
    if (!exists) {
      throw new Error(`${BASE_DIR} not found`)
    }
    const stat = await RNFS.stat(BASE_DIR)
    return stat.size
  }
}

const getCacheEntry = async uri => {
  const filename = uri.substring(
    uri.lastIndexOf('/'),
    uri.indexOf('?') === -1 ? uri.length : uri.indexOf('?'),
  )
  const ext =
    filename.indexOf('.') === -1
      ? '.jpg'
      : filename.substring(filename.lastIndexOf('.'))

  const path = `${BASE_DIR}${SHA1(uri)}${ext}`
  const tmpPath = `${BASE_DIR}${SHA1(uri)}-${_.uniqueId()}${ext}`

  try {
    await RNFS.mkdir(BASE_DIR)
  } catch (e) {
    // directory might already exist
  }

  const exists = await RNFS.exists(path)
  return { exists, path, tmpPath }
}

export const loadCachedItem = async ({ uri, options = {} }) => {
  if (uri) {
    try {
      const path = await CacheManager.get(uri, options).getPath()

      if (path) {
        return Platform.OS === 'android' ? `file://${path}` : path
      } else {
        return uri
      }
    } catch (error) {
      return uri
    }
  }
}
