import React from 'react';
import { StatusBar, SafeAreaView, Platform, View } from 'react-native';

export default class VoteScreen extends React.Component
{
  static navigationOptions = {
    title: 'Vote',
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
