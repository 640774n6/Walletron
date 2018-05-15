import React from 'react';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { FontAwesome, Entypo } from '@expo/vector-icons';

import WalletScreen from '../screens/WalletScreen.js'
import TransactionsScreen from '../screens/TransactionsScreen.js'
import RecipientsScreen from '../screens/RecipientsScreen.js'
import VoteScreen from '../screens/VoteScreen.js'
import SettingsScreen from '../screens/SettingsScreen.js'

const MainNavigator = createBottomTabNavigator(
{
  Wallet: createStackNavigator(
  { Root: WalletScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerTintColor: '#ffffff'
    }
  }),
  Transactions: createStackNavigator(
  { Root: TransactionsScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerTintColor: '#ffffff'
    }
  }),
  Vote: createStackNavigator(
  { Root: VoteScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerTintColor: '#ffffff'
    }
  }),
  Recipients: createStackNavigator(
  { Root: RecipientsScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerTintColor: '#ffffff'
    }
  }),
  Settings: createStackNavigator(
  { Root: SettingsScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: {
        backgroundColor: '#333333',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0
      },
      headerTintColor: '#ffffff'
    }
  }),
},
{
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
  tabBarOptions: {
      activeTintColor: '#ca2b1e',
      inactiveTintColor: '#777777',
    }
});

export default MainNavigator;
