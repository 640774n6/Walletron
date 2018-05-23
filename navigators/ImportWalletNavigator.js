import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { Platform, View } from 'react-native';

import ImportWalletScreen from '../screens/ImportWalletScreen.js'

const ImportWalletNavigator = createStackNavigator({
  Root: ImportWalletScreen
},
{
  initialRouteName: 'Root',
  navigationOptions:
  {
    headerTitleStyle: { flex: 1, textAlign: 'center' },
    headerStyle: {
      backgroundColor: '#ca2b1e',
      borderBottomWidth: 0,
      shadowOpacity: 0,
      elevation: 0
    },
    headerLeft: (Platform.OS === 'android' && <View/>),
    headerRight: (Platform.OS === 'android' && <View/>),
    headerTintColor: '#ffffff'
  }
})

export default ImportWalletNavigator;
