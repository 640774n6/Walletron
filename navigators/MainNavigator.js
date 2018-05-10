import React from 'react';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import FontAwesome, { Icons } from 'react-native-fontawesome';

import AccountScreen from '../screens/AccountScreen.js'
import TransactionsScreen from '../screens/TransactionsScreen.js'
import RecipientsScreen from '../screens/RecipientsScreen.js'
import VoteScreen from '../screens/VoteScreen.js'
import SettingsScreen from '../screens/SettingsScreen.js'

const MainNavigator = createBottomTabNavigator(
{
  Account: createStackNavigator(
  { Root: AccountScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: { backgroundColor: '#333333', borderBottomWidth: 0 },
      headerTintColor: '#ffffff'
    }
  }),
  Transactions: createStackNavigator(
  { Root: TransactionsScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: { backgroundColor: '#333333', borderBottomWidth: 0 },
      headerTintColor: '#ffffff'
    }
  }),
  Vote: createStackNavigator(
  { Root: VoteScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: { backgroundColor: '#333333', borderBottomWidth: 0 },
      headerTintColor: '#ffffff'
    }
  }),
  Recipients: createStackNavigator(
  { Root: RecipientsScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: { backgroundColor: '#333333', borderBottomWidth: 0 },
      headerTintColor: '#ffffff'
    }
  }),
  Settings: createStackNavigator(
  { Root: SettingsScreen },
  {
    initialRouteName: 'Root',
    navigationOptions:
    {
      headerStyle: { backgroundColor: '#333333', borderBottomWidth: 0 },
      headerTintColor: '#ffffff'
    }
  }),
},
{
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      switch(routeName)
      {
        case 'Account':
          iconName = Icons.idCard;
          break;
        case 'Transactions':
          iconName = Icons.exchange;
          break;
        case 'Vote':
          iconName = Icons.legal;
          break;
        case 'Recipients':
          iconName = Icons.addressBook;
          break;
        case 'Settings':
          iconName = Icons.cogs;
          break;
      }
      return (<FontAwesome color={tintColor} style={{fontSize: 22}}>{iconName}</FontAwesome>);
    }
  }),
  tabBarOptions: {
      activeTintColor: '#ca2b1e',
      inactiveTintColor: '#777777',
    }
});

export default MainNavigator;
