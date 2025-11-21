import fauth from '@react-native-firebase/auth'
import ffirestore from '@react-native-firebase/firestore'
import ffunctions from '@react-native-firebase/functions'

export const db = ffirestore
export const auth = fauth
export const firestore = ffirestore
export const functions = ffunctions
export const uploadMediaFunctionURL =
  'https://us-central1-development-69cdc.cloudfunctions.net/uploadMedia'
