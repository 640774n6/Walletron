import React from 'react';
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation';
import { Platform, View } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { AppLoading } from 'expo';

import TronWalletService from './libs/TronWalletService.js';
import NavigationHelper from './libs/NavigationHelper.js';

import ReceiveScreen from './screens/ReceiveScreen.js';
import SendScreen from './screens/SendScreen.js';
import ScanBarcodeScreen from './screens/ScanBarcodeScreen.js';
import FreezeScreen from './screens/FreezeScreen.js';
import CreateWalletScreen from './screens/CreateWalletScreen.js';
import ImportWalletScreen from './screens/ImportWalletScreen.js';

import StartScreen from './screens/StartScreen.js';
import HotWalletScreen from './screens/HotWalletScreen.js';
import ColdWalletScreen from './screens/ColdWalletScreen.js';
import PowerScreen from './screens/PowerScreen.js';
import VotesScreen from './screens/VotesScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';

const defaultStackNavigationOptions = {
  headerTitleStyle: { flex: 1, textAlign: 'center' },
  headerStyle: {
    backgroundColor: '#333333',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0
  },
  headerTintColor: '#ffffff'
}

const HotWalletBottomTabNavigator = createBottomTabNavigator(
{
  Wallet: createStackNavigator({ WalletRoot: HotWalletScreen }, { initialRouteName: 'WalletRoot', navigationOptions: defaultStackNavigationOptions }),
  Power: createStackNavigator({ PowerRoot: PowerScreen }, { initialRouteName: 'PowerRoot', navigationOptions: defaultStackNavigationOptions }),
  Votes: createStackNavigator({ VotesRoot: VotesScreen }, { initialRouteName: 'VotesRoot', navigationOptions: defaultStackNavigationOptions }),
  Settings: createStackNavigator({ SettingsRoot: SettingsScreen }, { initialRouteName: 'SettingsRoot', navigationOptions: defaultStackNavigationOptions })
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
        case 'Power':
          iconElement = (<FontAwesome name='bolt' color={tintColor} size={22} />);
          break;
        case 'Votes':
          iconElement = (<FontAwesome name='legal' color={tintColor} size={22} />);
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

const ColdWalletBottomTabNavigator = createBottomTabNavigator(
{
  Wallet: createStackNavigator({ WalletRoot: ColdWalletScreen }, { initialRouteName: 'WalletRoot', navigationOptions: defaultStackNavigationOptions }),
  Settings: createStackNavigator({ SettingsRoot: SettingsScreen }, { initialRouteName: 'SettingsRoot', navigationOptions: defaultStackNavigationOptions })
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
  CreateWallet: createStackNavigator({ CreateWalletRoot: CreateWalletScreen }, { initialRouteName: 'CreateWalletRoot', navigationOptions: defaultStackNavigationOptions }),
  ImportWallet: createStackNavigator({ ImportWalletRoot: ImportWalletScreen }, { initialRouteName: 'ImportWalletRoot', navigationOptions: defaultStackNavigationOptions }),
},
{
  initialRouteName: 'StartRoot',
  headerMode: 'none',
  mode: 'modal',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: NavigationHelper.transitionConfigurator
});

const HotWalletNavigator = createStackNavigator(
{
  HotRoot: HotWalletBottomTabNavigator,
  Send: createStackNavigator({ SendRoot: SendScreen }, { initialRouteName: 'SendRoot', navigationOptions: defaultStackNavigationOptions }),
  Receive: createStackNavigator({ ReceiveRoot: ReceiveScreen }, { initialRouteName: 'ReceiveRoot', navigationOptions: defaultStackNavigationOptions }),
  HotScanBarcode: createStackNavigator({ HotScanBarcodeRoot: ScanBarcodeScreen }, { initialRouteName: 'HotScanBarcodeRoot', navigationOptions: defaultStackNavigationOptions }),
  Freeze: createStackNavigator({ FreezeRoot: FreezeScreen }, { initialRouteName: 'FreezeRoot', navigationOptions: defaultStackNavigationOptions })
},
{
  initialRouteName: 'HotRoot',
  headerMode: 'none',
  mode: 'modal',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: NavigationHelper.transitionConfigurator
});

const ColdWalletNavigator = createStackNavigator(
{
  ColdRoot: ColdWalletBottomTabNavigator,
  ColdScanBarcode: createStackNavigator({ ColdScanBarcodeRoot: ScanBarcodeScreen }, { initialRouteName: 'ColdScanBarcodeRoot', navigationOptions: defaultStackNavigationOptions }),
},
{
  initialRouteName: 'ColdRoot',
  headerMode: 'none',
  mode: 'modal',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: NavigationHelper.transitionConfigurator
});

export default class App extends React.Component
{
  constructor()
  {
    super();

    var initState = {
      loading: true,
      walletType: -1,
    }
    this.state = initState;
  }

  async loadWallets() {
    await TronWalletService.load();
    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    { this.setState({ loading: false, walletType: currentWallet.type }); }
    else
    { this.setState({ loading: false }); }
  }

  async componentDidMount()
  {
    await this.loadWallets();
  }

  render()
  {
    if(this.state.loading)
    { return (<AppLoading/>); }

    var initialRouteName = 'Start';
    switch(this.state.walletType)
    {
      case 0:
      case 1:
        initialRouteName = 'Hot';
        break;
      case 2:
        initialRouteName = 'Cold';
        break;
      default:
        break;
    }

    const RootNavigator = createSwitchNavigator(
    { Start: StartNavigator, Hot: HotWalletNavigator, Cold: ColdWalletNavigator },
    { initialRouteName: initialRouteName });

    return (<RootNavigator/>);
  }
}
