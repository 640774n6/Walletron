import React from 'react';
import { StatusBar, SafeAreaView  } from 'react-native';

export default class RecipientsScreen extends React.Component
{
  static navigationOptions =
  {
    title: 'Recipients',
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
