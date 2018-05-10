import React from 'react';
import { StatusBar, SafeAreaView, View, Text, ScrollView } from 'react-native';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import { LinearGradient } from 'expo';

import TronLogoGraphic from '../graphics/TronLogoGraphic.js';

const HeaderRight = (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <FontAwesome color='#ffffff' style={{ fontSize: 24, marginRight: 15 }}>{Icons.send}</FontAwesome>
    <FontAwesome color='#ffffff' style={{ fontSize: 24, marginRight: 15 }}>{Icons.qrcode}</FontAwesome>
  </View>
);

const HeaderLeft = (
  <FontAwesome color='#ffffff' style={{ fontSize: 24, marginLeft: 15 }}>{Icons.bars}</FontAwesome>
);

export default class AccountScreen extends React.Component
{
  static navigationOptions =
  {
    title: 'Account',
    headerLeft: HeaderLeft,
    headerRight: HeaderRight
  };
  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
        <LinearGradient colors={['#333333', '#111111']} style={{ alignItems: 'center' }}>
          <TronLogoGraphic style={{ marginTop: 5 }} strokeColor='#ca2b1e' strokeWidth='3' width='100' height='100' />
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30, marginLeft: 15, marginRight: 15 }}>
            <Text style={{ color: '#ffffff', fontSize: 24 }}>6,186.8451 <Text style={{ color: '#ca2b1e', fontSize: 18 }}>TRX</Text></Text>
            <Text style={{ color: '#aaaaaa', fontSize: 16 }}>($632.50)</Text>
          </View>
        </LinearGradient>
        <ScrollView>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
