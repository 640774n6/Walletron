import React from 'react';
import { StatusBar, SafeAreaView, Platform, View } from 'react-native';

export default class ConfirmSendScreen extends React.Component
{
  static navigationOptions = {
    title: 'Confirm Send',
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
