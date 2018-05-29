import React from 'react';
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation';
import { Platform, View } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { AppLoading } from 'expo';

import TronWalletService from './libs/TronWalletService.js';
import NavigationHelper from './libs/NavigationHelper.js';

import ReceiveScreen from './screens/ReceiveScreen.js';
import SendScreen from './screens/SendScreen.js';
import ScanAddressScreen from './screens/ScanAddressScreen.js';
import CreateWalletScreen from './screens/CreateWalletScreen.js';
import ImportWalletScreen from './screens/ImportWalletScreen.js';

import StartScreen from './screens/StartScreen.js';
import WalletScreen from './screens/WalletScreen.js';
import TransactionsScreen from './screens/TransactionsScreen.js';
import VoteScreen from './screens/VoteScreen.js';
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

const MainScreenBottomTabNavigator = createBottomTabNavigator(
{
  Wallet: createStackNavigator({ WalletRoot: WalletScreen }, { initialRouteName: 'WalletRoot', navigationOptions: defaultStackNavigationOptions }),
  Transactions: createStackNavigator({ TransactionsRoot: TransactionsScreen }, { initialRouteName: 'TransactionsRoot', navigationOptions: defaultStackNavigationOptions }),
  Vote: createStackNavigator({ VoteRoot: VoteScreen }, { initialRouteName: 'VoteRoot', navigationOptions: defaultStackNavigationOptions }),
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
        case 'Transactions':
          iconElement = (<FontAwesome name='exchange' color={tintColor} size={22} />);
          break;
        case 'Vote':
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

const MainNavigator = createStackNavigator(
{
  MainRoot: MainScreenBottomTabNavigator,
  Send: createStackNavigator({ SendRoot: SendScreen }, { initialRouteName: 'SendRoot', navigationOptions: defaultStackNavigationOptions }),
  Receive: createStackNavigator({ ReceiveRoot: ReceiveScreen }, { initialRouteName: 'ReceiveRoot', navigationOptions: defaultStackNavigationOptions }),
  ScanAddress: createStackNavigator({ ScanAddressRoot: ScanAddressScreen }, { initialRouteName: 'ScanAddressRoot', navigationOptions: defaultStackNavigationOptions })
},
{
  initialRouteName: 'MainRoot',
  headerMode: 'none',
  mode: 'modal',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: NavigationHelper.transitionConfigurator
});

const RootNavigator = createSwitchNavigator(
{
  Start: StartNavigator,
  Main: MainNavigator
},
{
  initialRouteName: 'Main',
});

export default class App extends React.Component
{
  constructor()
  {
    super();
    this.state = { loading: true };
  }

  async componentDidMount()
  {
    await TronWalletService.load();
    var wallet = TronWalletService.getCurrentWallet();
    if(!wallet)
    {
      wallet = {
        name: 'Brando Wallet',
        address: '27c1akzkGRZup6DFLtxM5ErfPzAxaJv2dcW',
        privateKey: '7BE5272664163BFDE05D0148769EFDA7279C6CD4B997288DAA99965639D09481',
        balance: 0.0,
        assets: [],
        timestamp: null
      }
      TronWalletService.addWallet(wallet);
      TronWalletService.setCurrentWalletByName(wallet.name);
      await TronWalletService.save();
    }
    this.setState({ loading: false });
  }

  render()
  {
    if(this.state.loading)
    { return (<AppLoading/>); }

    return (<RootNavigator/>);
  }
}
