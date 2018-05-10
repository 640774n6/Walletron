import React from 'react';
import { StatusBar, SafeAreaView  } from 'react-native';
import FontAwesome, { Icons } from 'react-native-fontawesome';

export default class VoteScreen extends React.Component
{
  static navigationOptions = { title: 'Vote' };
  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
      </SafeAreaView>
    );
  }
}
