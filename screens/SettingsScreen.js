import React from 'react';
import { StatusBar, SafeAreaView  } from 'react-native';

export default class SettingsScreen extends React.Component
{
  static navigationOptions = { title: 'Settings' };
  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
      </SafeAreaView>
    );
  }
}
