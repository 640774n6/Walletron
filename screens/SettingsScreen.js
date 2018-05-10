import React from 'react';
import { StatusBar, SafeAreaView  } from 'react-native';
import FontAwesome, { Icons } from 'react-native-fontawesome';

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
