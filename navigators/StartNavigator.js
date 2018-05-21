import React from 'react';
import { createStackNavigator } from 'react-navigation';

import StartScreen from '../screens/StartScreen.js';
import CreateWalletNavigator from '../navigators/CreateWalletNavigator.js';
import ImportWalletNavigator from '../navigators/ImportWalletNavigator.js';

const StartNavigator = createStackNavigator({
  Root: StartScreen,
  CreateWallet: CreateWalletNavigator,
  ImportWallet: ImportWalletNavigator
},
{
  initialRouteName: 'Root',
  mode: 'modal',
  headerMode: 'none',
  navigationOptions: {
    gesturesEnabled: false
  }
});

export default StartNavigator;
