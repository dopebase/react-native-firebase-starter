import React, { useState, useEffect, useRef } from 'react'
import {
  Image,
  Keyboard,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import PhoneInput from 'react-native-phone-number-input'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'
import { useNavigation, useRoute } from '@react-navigation/core'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication'
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
  Alert,
  ProfilePictureSelector,
} from '../../../dopebase'
import { setUserData } from '../../redux/auth'
import { useDispatch } from 'react-redux'
import { localizedErrorMessage } from '../../api/ErrorCode'
import TermsOfUseView from '../../components/TermsOfUseView'
import dynamicStyles from './styles'
import IMGoogleSignInButton from '../../components/IMGoogleSignInButton/IMGoogleSignInButton'
import { useOnboardingConfig } from '../../hooks/useOnboardingConfig'
import { useAuth } from '../../hooks/useAuth'

const codeInputCellCount = 6

const SmsAuthenticationScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const {
    isSigningUp,
    isConfirmSignUpCode,
    isConfirmResetPasswordCode,
    email,
    userInfo,
  } = route.params

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const authManager = useAuth()
  const dispatch = useDispatch()

  const styles = dynamicStyles(theme, appearance)
  const { config } = useOnboardingConfig()

  const [inputFields, setInputFields] = useState({})
  const [loading, setLoading] = useState(false)
  const [isPhoneVisible, setIsPhoneVisible] = useState(
    !isConfirmSignUpCode && !isConfirmResetPasswordCode,
  )
  const [phoneNumber, setPhoneNumber] = useState(false)
  const [countriesPickerData, setCountriesPickerData] = useState(null)
  const [verificationId, setVerificationId] = useState(null)
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [countryModalVisible, setCountryModalVisible] = useState(false)
  const [codeInputValue, setCodeInputValue] = useState('')

  const myCodeInput = useBlurOnFulfill({
    codeInputValue,
    value: codeInputValue,
    cellCount: codeInputCellCount,
  })
  const [codeInputProps, getCellOnLayoutHandler] = useClearByFocusCell({
    codeInputValue,
    value: codeInputValue,
    setCodeInputValue,
    setValue: setCodeInputValue,
  })

  const phoneRef = useRef(null)

  const [value, setValue] = useState('')
  const [formattedValue, setFormattedValue] = useState('')

  useEffect(() => {
    if (codeInputValue?.trim()?.length === codeInputCellCount) {
      onFinishCheckingCode(codeInputValue)
    }
  }, [codeInputValue])

  const onFBButtonPress = () => {
    setLoading(true)
    authManager.loginOrSignUpWithFacebook(config).then(response => {
      if (response?.user) {
        const user = response.user
        dispatch(setUserData({ user }))
        Keyboard.dismiss()
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainStack', params: { user } }],
        })
      } else {
        setLoading(false)
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          },
        )
      }
    })
  }

  const onGoogleButtonPress = () => {
    setLoading(true)
    authManager.loginOrSignUpWithGoogle(config).then(response => {
      if (response?.user) {
        const user = response.user
        dispatch(setUserData({ user }))
        Keyboard.dismiss()
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainStack', params: { user } }],
        })
      } else {
        setLoading(false)
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          },
        )
      }
    })
  }

  const onAppleButtonPress = async () => {
    setLoading(true)
    authManager.loginOrSignUpWithApple(config).then(response => {
      if (response?.user) {
        const user = response.user
        dispatch(setUserData({ user }))
        Keyboard.dismiss()
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainStack', params: { user } }],
        })
      } else {
        setLoading(false)
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          },
        )
      }
    })
  }

  const signInWithPhoneNumber = userValidPhoneNumber => {
    setLoading(true)
    authManager.sendSMSToPhoneNumber(userValidPhoneNumber).then(response => {
      setLoading(false)
      const confirmationResult = response.confirmationResult
      if (confirmationResult) {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult
        setVerificationId(confirmationResult.verificationId)
        setIsPhoneVisible(false)
      } else {
        // Error; SMS not sent
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          { cancelable: false },
        )
      }
    })
  }

  const trimFields = fields => {
    var trimmedFields = {}
    Object.keys(fields).forEach(key => {
      if (fields[key]) {
        trimmedFields[key] = fields[key].trim()
      }
    })
    return trimmedFields
  }

  const signUpWithPhoneNumber = smsCode => {
    const userDetails = {
      ...trimFields(inputFields),
      phone: phoneNumber?.trim(),
      photoFile: profilePictureFile,
    }
    authManager
      .registerWithPhoneNumber(
        userDetails,
        smsCode,
        verificationId,
        config.appIdentifier,
      )
      .then(response => {
        setLoading(false)
        if (response.error) {
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{ text: localized('OK') }],
            { cancelable: false },
          )
        } else {
          const user = response.user
          dispatch(setUserData({ user }))
          Keyboard.dismiss()
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainStack', params: { user } }],
          })
        }
      })
  }


  const onPressSend = async () => {
    const isValid = phoneRef.current?.isValidNumber(value);
    if (isValid) {
      const userValidPhoneNumber = formattedValue
      setLoading(true)
      setPhoneNumber(userValidPhoneNumber)
      if (isSigningUp) {
        const { error } = await authManager.validateUsernameFieldIfNeeded(
          trimFields(inputFields),
          config,
        )

        if (error) {
          Alert.alert(
            '',
            localized(error),
            [{ text: localized('OK'), onPress: () => setLoading(false) }],
            {
              cancelable: false,
            },
          )
          return
        }
      }

      signInWithPhoneNumber(userValidPhoneNumber)
    } else {
      Alert.alert(
        '',
        localized('Please enter a valid phone number.'),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        },
      )
    }
  }

  const onFinishCheckingCode = newCode => {
    setLoading(true)
    if (isSigningUp) {
      signUpWithPhoneNumber(newCode)
      return
    }

    if (!isSigningUp) {
      authManager.loginWithSMSCode(newCode, verificationId).then(response => {
        if (response.error) {
          setLoading(false)
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{ text: localized('OK') }],
            { cancelable: false },
          )
        } else {
          const user = response.user
          dispatch(setUserData({ user }))
          Keyboard.dismiss()
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainStack', params: { user } }],
          })
        }
      })
    }
  }

  const onChangeInputFields = (text, key) => {
    setInputFields(prevFields => ({
      ...prevFields,
      [key]: text,
    }))
  }

  const renderPhoneInput = () => {
    return (
      <>
        <PhoneInput
          ref={phoneRef}
          defaultValue={value}
          defaultCode="US"
          layout="first"
          onChangeText={(text) => {
            setValue(text);
          }}
          onChangeFormattedText={(text) => {
            setFormattedValue(text);
          }}
          containerStyle={{ width: '100%', height: 60, backgroundColor: '#f5f5f5', borderRadius: 10, marginVertical: 10 }}
          textContainerStyle={{ backgroundColor: '#f5f5f5', borderRadius: 10 }}
          withDarkTheme
          withShadow
          autoFocus
        />
        <TouchableOpacity style={styles.sendContainer} onPress={onPressSend}>
          <Text style={styles.sendText}>{localized('Send code')}</Text>
        </TouchableOpacity>
      </>
    )
  }

  const renderCodeInputCell = ({ index, symbol, isFocused }) => {
    let textChild = symbol

    if (isFocused) {
      textChild = <Cursor />
    }

    return (
      <Text
        key={index}
        style={[styles.codeInputCell, isFocused && styles.focusCell]}
        onLayout={getCellOnLayoutHandler(index)}>
        {textChild}
      </Text>
    )
  }

  const renderCodeInput = () => {
    return (
      <View style={styles.codeFieldContainer}>
        <CodeField
          ref={myCodeInput}
          {...codeInputProps}
          value={codeInputValue}
          onChangeText={setCodeInputValue}
          cellCount={codeInputCellCount}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={renderCodeInputCell}
        />
      </View>
    )
  }

  const renderInputField = (field, index) => {
    return (
      <TextInput
        key={index?.toString()}
        style={styles.InputContainer}
        placeholder={field.placeholder}
        placeholderTextColor="#aaaaaa"
        onChangeText={text => onChangeInputFields(text, field.key)}
        value={inputFields[field.key]}
        underlineColorAndroid="transparent"
      />
    )
  }

  const renderAsSignUpState = () => {
    return (
      <>
        <Text style={styles.title}>{localized('Create new account')}</Text>
        {!isConfirmSignUpCode && (
          <ProfilePictureSelector
            setProfilePictureFile={setProfilePictureFile}
          />
        )}
        {!isConfirmSignUpCode && config.smsSignupFields.map(renderInputField)}
        {isPhoneVisible ? renderPhoneInput() : renderCodeInput()}
        {isConfirmSignUpCode && (
          <Text style={styles.orTextStyle}>
            {localized('Please check your e-mail for a confirmation code.')}
          </Text>
        )}
        {!isConfirmSignUpCode && (
          <>
            <Text style={styles.orTextStyle}> {localized('OR')}</Text>
            <TouchableOpacity
              style={styles.signWithEmailContainer}
              onPress={() => navigation.navigate('Signup')}>
              <Text>{localized('Sign up with E-mail')}</Text>
            </TouchableOpacity>
          </>
        )}
      </>
    )
  }

  const renderAsLoginState = () => {
    const appleButtonStyle = config.isAppleAuthEnabled
      ? {
        dark: AppleButton?.Style?.WHITE,
        light: AppleButton?.Style?.BLACK,
        'no-preference': AppleButton?.Style?.WHITE,
      }
      : {}

    return (
      <>
        {isConfirmResetPasswordCode ? (
          <Text style={styles.title}>{localized('Reset Password')}</Text>
        ) : (
          <Text style={styles.title}>{localized('Sign In')}</Text>
        )}
        {isPhoneVisible ? renderPhoneInput() : renderCodeInput()}
        {isConfirmResetPasswordCode && (
          <Text style={styles.orTextStyle}>
            {localized('Please check your e-mail for a confirmation code.')}
          </Text>
        )}
        {config.isFacebookAuthEnabled && (
          <>
            <Text style={styles.orTextStyle}> {localized('OR')}</Text>
            <TouchableOpacity
              style={styles.facebookContainer}
              onPress={() => onFBButtonPress()}>
              <Text style={styles.facebookText}>
                {localized('Login With Facebook')}
              </Text>
            </TouchableOpacity>
          </>
        )}
        {config.isGoogleAuthEnabled && (
          <IMGoogleSignInButton
            containerStyle={styles.googleButtonStyle}
            onPress={onGoogleButtonPress}
          />
        )}
        {config.isAppleAuthEnabled && appleAuth.isSupported && (
          <AppleButton
            cornerRadius={25}
            style={styles.appleButtonContainer}
            buttonStyle={appleButtonStyle[appearance]}
            buttonType={AppleButton.Type.SIGN_IN}
            onPress={() => onAppleButtonPress()}
          />
        )}
        <TouchableOpacity
          style={styles.signWithEmailContainer}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signWithEmailText}>
            {localized('Sign in with E-mail')}
          </Text>
        </TouchableOpacity>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps="always">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>
        {isSigningUp && renderAsSignUpState()}
        {!isSigningUp && renderAsLoginState()}
        {isSigningUp && (
          <TermsOfUseView
            tosLink={config.tosLink}
            privacyPolicyLink={config.privacyPolicyLink}
            style={styles.tos}
          />
        )}
      </KeyboardAwareScrollView>
      {loading && <ActivityIndicator />}
    </View>
  )
}

export default SmsAuthenticationScreen
