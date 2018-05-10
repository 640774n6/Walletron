import React from 'react';
import { StatusBar, SafeAreaView  } from 'react-native';

export default class TransactionsScreen extends React.Component
{
  static navigationOptions = { title: 'Transactions' };
  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
      </SafeAreaView>
    );
  }
}
