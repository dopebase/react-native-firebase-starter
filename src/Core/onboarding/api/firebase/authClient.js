import messaging from '@react-native-firebase/messaging'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { updateUser } from '../../../users'
import { ErrorCode } from '../ErrorCode'
import { getUnixTimeStamp } from '../../../helpers/timeFormat'

const usersRef = () => firestore().collection('users')

const handleUserFromAuthStateChanged = (user, resolve) => {
  if (user) {
    usersRef()
      .doc(user.uid)
      .get()
      .then(document => {
        const userData = document.data()
        resolve({ ...userData, id: user.uid, userID: user.uid })
      })
      .catch(error => {
        resolve(null)
      })
  } else {
    resolve(null)
  }
}

export const retrievePersistedAuthUser = () => {
  return new Promise(resolve => {
    return auth().onAuthStateChanged(user => {
      return handleUserFromAuthStateChanged(user, resolve)
    })
  })
}

export const sendPasswordResetEmail = email => {
  auth().sendPasswordResetEmail(email)
}

export const checkUniqueUsername = username => {
  return new Promise(resolve => {
    if (!username) {
      resolve()
    }
    usersRef()
      .where('username', '==', username?.toLowerCase())
      .get()
      .then(querySnapshot => {
        if (querySnapshot?.docs.length <= 0) {
          // doesn't exist
          resolve({ isUnique: true })
        } else {
          // does exist
          resolve({ taken: true })
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const registerWithEmail = (userDetails, appIdentifier) => {
  const {
    email,
    firstName,
    lastName,
    username,
    password,
    phone,
    profilePictureURL,
    location,
    signUpLocation,
  } = userDetails
  return new Promise(function (resolve, _reject) {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async response => {
        const usernameResponse = await checkUniqueUsername(username)

        if (usernameResponse?.taken) {
          auth().currentUser.delete()
          return resolve({ error: ErrorCode.usernameInUse })
        }

        const timestamp = getUnixTimeStamp()
        const uid = response.user.uid

        const data = {
          id: uid,
          userID: uid, // legacy reasons
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          username: (username || '')?.toLowerCase(),
          phone: phone || '',
          profilePictureURL,
          location: location || '',
          signUpLocation: signUpLocation || '',
          appIdentifier,
          createdAt: timestamp,
        }
        usersRef()
          .doc(uid)
          .set(data)
          .then(() => {
            resolve({ user: data })
          })
          .catch(error => {
            alert(error)
            resolve({ error: ErrorCode.serverError })
          })
      })
      .catch(error => {
        console.log('_error:', error)
        var errorCode = ErrorCode.serverError
        if (error.code === 'auth/email-already-in-use') {
          errorCode = ErrorCode.emailInUse
        }
        resolve({ error: errorCode })
      })
  })
}

export const loginWithEmailAndPassword = async (email, password) => {
  return new Promise(function (resolve, reject) {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        const uid = response.user.uid

        const userData = {
          email,
          id: uid,
        }
        usersRef()
          .doc(uid)
          .get()
          .then(function (firestoreDocument) {
            if (!firestoreDocument.exists) {
              resolve({ errorCode: ErrorCode.noUser })
              return
            }
            const user = firestoreDocument.data()
            const newUserData = {
              ...userData,
              ...user,
            }
            resolve({ user: newUserData })
          })
          .catch(function (_error) {
            console.log('_error:', _error)
            resolve({ error: ErrorCode.serverError })
          })
      })
      .catch(error => {
        console.log('error:', error)
        var errorCode = ErrorCode.serverError
        switch (error.code) {
          case 'auth/wrong-password':
            errorCode = ErrorCode.invalidPassword
            break
          case 'auth/network-request-failed':
            errorCode = ErrorCode.serverError
            break
          case 'auth/user-not-found':
            errorCode = ErrorCode.noUser
            break
          default:
            errorCode = ErrorCode.serverError
        }
        resolve({ error: errorCode })
      })
  })
}


const signInWithCredential = (credential, appIdentifier, socialAuthType) => {
  return new Promise((resolve, _reject) => {
    auth()
      .signInWithCredential(credential)
      .then(response => {
        const isNewUser = response.additionalUserInfo.isNewUser
        const { first_name, last_name, family_name, given_name } =
          response.additionalUserInfo.profile
        const { uid, email, phoneNumber, photoURL } = response.user
        const defaultProfilePhotoURL =
          'https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg'

        if (isNewUser) {
          const timestamp = getUnixTimeStamp()
          const userData = {
            id: uid,
            email: email || '',
            firstName: first_name || given_name || socialAuthType || '',
            lastName: last_name || family_name || 'User',
            phone: phoneNumber || '',
            profilePictureURL: photoURL || defaultProfilePhotoURL,
            userID: uid,
            appIdentifier,
            createdAt: timestamp,
            ...(socialAuthType ? { socialAuthType } : {}),
          }
          usersRef()
            .doc(uid)
            .set(userData)
            .then(() => {
              resolve({
                user: { ...userData, id: uid, userID: uid },
                accountCreated: true,
              })
            })
        }
        usersRef()
          .doc(uid)
          .get()
          .then(document => {
            const userData = document.data()
            resolve({
              user: { ...userData, id: uid, userID: uid },
              accountCreated: false,
            })
          })
      })
      .catch(_error => {
        console.log(_error)
        resolve({ error: ErrorCode.serverError })
      })
  })
}

export const loginWithApple = (identityToken, nonce, appIdentifier) => {
  const appleCredential = auth.AppleAuthProvider.credential(
    identityToken,
    nonce,
  )

  return new Promise((resolve, _reject) => {
    signInWithCredential(appleCredential, appIdentifier, 'Apple').then(
      response => {
        resolve(response)
      },
    )
  })
}

export const loginWithFacebook = (accessToken, appIdentifier) => {
  const credential = auth.FacebookAuthProvider.credential(accessToken)

  return new Promise((resolve, _reject) => {
    signInWithCredential(credential, appIdentifier, 'Facebook').then(
      response => {
        resolve(response)
      },
    )
  })
}

export const loginWithGoogle = (idToken, appIdentifier) => {
  const credential = auth.GoogleAuthProvider.credential(idToken)

  return new Promise((resolve, _reject) => {
    signInWithCredential(credential, appIdentifier, 'Google').then(response => {
      resolve(response)
    })
  })
}

export const onVerificationChanged = phone => {
  auth()
    .verifyPhoneNumber(phone)
    .on(
      'state_changed',
      phoneAuthSnapshot => {
        console.log('State: ', phoneAuthSnapshot.state)
      },
      error => {
        console.error(error)
      },
      phoneAuthSnapshot => {
        console.log(phoneAuthSnapshot)
      },
    )
}

export const retrieveUserByPhone = phone => {
  return new Promise(resolve => {
    if (!phone) {
      resolve()
    }
    usersRef()
      .where('phone', '==', phone)
      .get()
      .then(querySnapshot => {
        if (querySnapshot?.docs.length <= 0) {
          resolve({ error: true })
        } else {
          resolve({ success: true })
        }
      })
  })
}

export const sendSMSToPhoneNumber = phoneNumber => {
  return new Promise(function (resolve, _reject) {
    auth()
      .signInWithPhoneNumber(phoneNumber)
      .then(function (confirmationResult) {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        resolve({ confirmationResult })
      })
      .catch(function (_error) {
        console.log(_error)
        console.warn(_error)
        resolve({ error: ErrorCode.smsNotSent })
      })
  })
}

export const loginWithSMSCode = (smsCode, verificationID) => {
  const credential = auth.PhoneAuthProvider.credential(verificationID, smsCode)
  return new Promise(function (resolve, _reject) {
    auth()
      .signInWithCredential(credential)
      .then(result => {
        const { user } = result
        usersRef()
          .doc(user.uid)
          .get()
          .then(function (firestoreDocument) {
            if (!firestoreDocument.exists) {
              resolve({ errorCode: ErrorCode.noUser })
              return
            }
            const userData = firestoreDocument.data()
            resolve({ user: userData })
          })
          .catch(function (_error) {
            resolve({ error: ErrorCode.serverError })
          })
      })
      .catch(_error => {
        resolve({ error: ErrorCode.invalidSMSCode })
      })
  })
}

export const registerWithPhoneNumber = (
  userDetails,
  smsCode,
  verificationID,
  appIdentifier,
) => {
  const {
    firstName,
    lastName,
    username,
    phone,
    profilePictureURL,
    location,
    signUpLocation,
  } = userDetails
  const credential = auth.PhoneAuthProvider.credential(verificationID, smsCode)
  return new Promise(function (resolve, _reject) {
    auth()
      .signInWithCredential(credential)
      .then(async response => {
        const phoneResponse = await retrieveUserByPhone(phone)
        if (phoneResponse?.success) {
          auth().currentUser.delete()
          return resolve({ error: ErrorCode.phoneInUse })
        }
        const usernameResponse = await checkUniqueUsername(username)

        if (usernameResponse?.taken) {
          auth().currentUser.delete()
          return resolve({ error: ErrorCode.usernameInUse })
        }

        const timestamp = getUnixTimeStamp()
        const uid = response.user.uid
        const data = {
          id: uid,
          userID: uid, // legacy reasons
          firstName: firstName || '',
          lastName: lastName || '',
          username: (username || '')?.toLowerCase(),
          phone,
          profilePictureURL,
          location: location || '',
          signUpLocation: signUpLocation || '',
          appIdentifier,
          createdAt: timestamp,
        }
        usersRef()
          .doc(uid)
          .set(data)
          .then(() => {
            resolve({ user: data })
          })
      })
      .catch(error => {
        console.log(error)
        var errorCode = ErrorCode.serverError
        if (error.code === 'auth/email-already-in-use') {
          errorCode = ErrorCode.emailInUse
        }
        resolve({ error: errorCode })
      })
  })
}


export const updateProfilePhoto = (userID, profilePictureURL) => {
  return new Promise((resolve, _reject) => {
    usersRef()
      .doc(userID)
      .update({ profilePictureURL: profilePictureURL })
      .then(() => {
        resolve({ success: true })
      })
      .catch(error => {
        resolve({ error: error })
      })
  })
}

export const fetchAndStorePushTokenIfPossible = async user => {
  try {
    const settings = await messaging().requestPermission()
    if (settings) {
      const token = await messaging().getToken()
      updateUser(user.id || user.userID, {
        pushToken: token,
        pushKitToken: '',
        badgeCount: 0,
      })
    }

  } catch (error) {
    console.log(error)
  }
}

export const removeUser = userID => {
  return new Promise(resolve => {
    usersRef()
      .doc(userID)
      .delete()
      .then(() => {
        auth()
          .currentUser.delete()
          .then(() => {
            resolve({ success: true })
          })
          .catch(error => {
            let errorCode = ''
            if ((error.code = 'auth/requires-recent-login')) {
              errorCode = ErrorCode.requiresRecentLogin
            }
            resolve({ success: false, error: errorCode })
          })
      })
      .catch(error => {
        console.log(error)
        resolve({ success: false, error })
      })
  })
}

export const logout = () => {
  auth().signOut()
}
