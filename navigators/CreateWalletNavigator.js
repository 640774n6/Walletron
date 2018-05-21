import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { Platform } from 'react-native';

import CreateWalletScreen from '../screens/CreateWalletScreen.js'

const CreateWalletNavigator = createStackNavigator({
  Root: CreateWalletScreen
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

export default CreateWalletNavigator;
