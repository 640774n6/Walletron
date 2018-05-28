import React from 'react';
import { StatusBar, SafeAreaView, Platform, View } from 'react-native';

export default class TransactionsScreen extends React.Component
{
  static navigationOptions = {
    title: 'Transactions',
    headerLeft: (Platform.OS === 'android' && <View/>),
    headerRight: (Platform.OS === 'android' && <View/>)
  };

  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
      </SafeAreaView>
    );
  }
}
