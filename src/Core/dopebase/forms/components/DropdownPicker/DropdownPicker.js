import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { useTheme, useTranslations } from '../../../core'
import dynamicStyles from './styles'

export const DropdownPicker = ({
  title,
  items,
  onSelectItem,
  allowMultipleSelection = false,
  selectedItemsList = [],
}) => {
  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const dropdownButton = useRef()
  const [selectedItems, setSelectedItems] = useState([])
  const [showDropDown, setShowDropDown] = useState(false)
  const [dropdownLocation, setDropdownLocation] = useState(0)

  useEffect(() => {
    allowMultipleSelection
      ? setSelectedItems(selectedItemsList)
      : setSelectedItems([selectedItemsList[0]])
  }, [])

  const onDropdownItemPress = item => {
    let tempArr = JSON.parse(JSON.stringify(selectedItems))
    if (selectedItems.includes(item)) {
      setSelectedItems(tempArr.filter(x => x !== item))
    } else if (allowMultipleSelection) {
      tempArr.push(item)
      setSelectedItems(tempArr)
    } else {
      setSelectedItems([item])
      setShowDropDown(false)
    }
  }

  const onDropDownDismiss = () => {
    onSelectItem(selectedItems)
  }

  const toggleDropdown = () => {
    showDropDown ? setShowDropDown(false) : openDropdown()
  }

  const openDropdown = () => {
    dropdownButton.current.measure((fx, fy, w, h, px, py) => {
      setDropdownLocation({ top: py + h, left: px })
    })
    setShowDropDown(true)
  }

  const renderDropdown = () => {
    return (
      <Modal
        visible={showDropDown}
        onDismiss={onDropDownDismiss}
        transparent
        animationType="none">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setShowDropDown(false)}>
          <View style={styles.shadowContainer}>
            <View style={[styles.dropdown, dropdownLocation]}>
              <ScrollView activeOpacity={1}>
                {items.map(itm => {
                  return (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => onDropdownItemPress(itm)}
                      key={itm + 'index'}
                      style={[
                        selectedItems.includes(itm) && {
                          backgroundColor: theme.colors[appearance].grey0,
                        },
                        styles.item,
                      ]}>
                      {allowMultipleSelection && (
                        <CheckBox
                          style={styles.checkbox}
                          value={selectedItems.includes(itm)}
                        />
                      )}
                      <Text style={styles.itemText}>{itm}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{localized(title)}</Text>
      </View>
      <View style={styles.listContainer}>
        <TouchableOpacity
          ref={dropdownButton}
          activeOpacity={1}
          onPress={toggleDropdown}
          style={styles.selectedItemContainer}>
          <Text style={styles.itemText}>
            {selectedItems.length && !allowMultipleSelection
              ? selectedItems[0]
              : localized('Select Option')}
          </Text>
        </TouchableOpacity>
        {renderDropdown()}
      </View>
    </View>
  )
}
