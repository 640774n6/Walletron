import React from 'react';
import { StatusBar, SafeAreaView  } from 'react-native';
import FontAwesome, { Icons } from 'react-native-fontawesome';

const HeaderRight = (
  <FontAwesome color='#ffffff' style={{ fontSize: 24, marginRight: 15 }}>{Icons.plus}</FontAwesome>
);

export default class RecipientsScreen extends React.Component
{
  static navigationOptions =
  {
    title: 'Recipients',
    headerRight: HeaderRight
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
