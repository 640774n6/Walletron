import React from 'react';
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation';
import { Platform, View } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';

import NavigationHelper from './libs/NavigationHelper.js';

import ReceiveScreen from './screens/ReceiveScreen.js';
import SendScreen from './screens/SendScreen.js';
import CreateWalletScreen from './screens/CreateWalletScreen.js';
import ImportWalletScreen from './screens/ImportWalletScreen.js';

import StartScreen from './screens/StartScreen.js';
import WalletScreen from './screens/WalletScreen.js';
import TransactionsScreen from './screens/TransactionsScreen.js';
import RecipientsScreen from './screens/RecipientsScreen.js';
import VoteScreen from './screens/VoteScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';

const MainScreenBottomTabNavigator = createBottomTabNavigator(
{
  Wallet: createStackNavigator(
  { WalletRoot: WalletScreen },
  {
    initialRouteName: 'WalletRoot',
    navigationOptions:
    {
      headerTitleStyle: { flex: 1, textAlign: 'center' },
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (Platform.OS === 'android' && <View/>),
      headerTintColor: '#ffffff'
    }
  }),
  Transactions: createStackNavigator(
  { TransactionsRoot: TransactionsScreen },
  {
    initialRouteName: 'TransactionsRoot',
    navigationOptions:
    {
      headerTitleStyle: { flex: 1, textAlign: 'center' },
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (Platform.OS === 'android' && <View/>),
      headerTintColor: '#ffffff'
    }
  }),
  Vote: createStackNavigator(
  { VoteRoot: VoteScreen },
  {
    initialRouteName: 'VoteRoot',
    navigationOptions:
    {
      headerTitleStyle: { flex: 1, textAlign: 'center' },
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (Platform.OS === 'android' && <View/>),
      headerTintColor: '#ffffff'
    }
  }),
  Recipients: createStackNavigator(
  { RecipientsRoot: RecipientsScreen },
  {
    initialRouteName: 'RecipientsRoot',
    navigationOptions:
    {
      headerTitleStyle: { flex: 1, textAlign: 'center' },
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (Platform.OS === 'android' && <View/>),
      headerTintColor: '#ffffff'
    }
  }),
  Settings: createStackNavigator(
  { SettingsRoot: SettingsScreen },
  {
    initialRouteName: 'SettingsRoot',
    navigationOptions:
    {
      headerTitleStyle: { flex: 1, textAlign: 'center' },
      headerStyle:
      {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (Platform.OS === 'android' && <View/>),
      headerTintColor: '#ffffff'
    }
  })
},
{
  initialRouteName: 'Wallet',
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;
      let iconElement;
      switch(routeName)
      {
        case 'Wallet':
          iconElement = (<Entypo name='wallet' color={tintColor} size={22} />);
          break;
        case 'Transactions':
          iconElement = (<FontAwesome name='exchange' color={tintColor} size={22} />);
          break;
        case 'Vote':
          iconElement = (<FontAwesome name='legal' color={tintColor} size={22} />);
          break;
        case 'Recipients':
          iconElement = (<FontAwesome name='address-book' color={tintColor} size={22} />);
          break;
        case 'Settings':
          iconElement = (<FontAwesome name='cogs' color={tintColor} size={22} />);
          break;
      }
      return iconElement;
    }
  }),
  tabBarOptions:
  {
      activeTintColor: '#ca2b1e',
      inactiveTintColor: '#777777',
  }
});

const StartNavigator = createStackNavigator(
{
  StartRoot: StartScreen,
  CreateWallet: NavigationHelper.createSingleScreenNavigator({ CreateWalletContent: CreateWalletScreen }),
  ImportWallet: NavigationHelper.createSingleScreenNavigator({ ImportWalletContent: ImportWalletScreen }),
},
{
  initialRouteName: 'StartRoot',
  headerMode: 'none',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: NavigationHelper.transitionConfigurator
});

const MainNavigator = createStackNavigator(
{
  MainRoot: MainScreenBottomTabNavigator,
  Receive: NavigationHelper.createSingleScreenNavigator({ ReceiveContent: ReceiveScreen }),
  Send: NavigationHelper.createSingleScreenNavigator({ SendContent: SendScreen })
},
{
  initialRouteName: 'MainRoot',
  headerMode: 'none',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: NavigationHelper.transitionConfigurator
});

const RootNavigator = createSwitchNavigator(
{
  Start: StartNavigator,
  Main: MainNavigator,
},
{
  initialRouteName: 'Start',
});

export default class App extends React.Component
{
  render()
  {
    return (<RootNavigator/>);
  }
}
