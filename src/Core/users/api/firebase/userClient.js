import { db } from '../../../firebase/config'
import { getUnixTimeStamp } from '../../../helper/timeFormat'

export const usersRef = () => db().collection('users')

export const updateUser = async (userID, newData) => {
  const dataWithOnlineStatus = {
    ...newData,
    lastOnlineTimestamp: getUnixTimeStamp(),
  }
  try {
    await usersRef().doc(userID).set({ ...dataWithOnlineStatus }, { merge: true })
    return { success: true }
  } catch (error) {
    return error
  }
}

export const getUserByID = async userID => {
  try {
    const document = await usersRef().doc(userID).get()
    if (document) {
      return document.data()
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const updateProfilePhoto = async (userID, profilePictureURL) => {
  try {
    await usersRef().doc(userID).update({ profilePictureURL: profilePictureURL })
    return { success: true }
  } catch (error) {
    console.log(error)
    return { error: error }
  }
}
