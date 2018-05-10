import React from 'react';
import { StatusBar, SafeAreaView, View, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements'
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo';

import TronLogoGraphic from '../graphics/TronLogoGraphic.js';

const HeaderRight = (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <FontAwesome name='send' color='#ffffff' size={24} style={{ marginRight: 15 }}/>
    <FontAwesome name='qrcode' color='#ffffff' size={24} style={{ marginRight: 15 }}/>
  </View>
);

const HeaderLeft = (
  <FontAwesome name='bars' color='#ffffff' size={24} style={{ marginLeft: 15 }}/>
);

const listData = [
  { title: 'AwesomeCoin', icon: 'coin', iconType: 'material-community' },
  { title: 'MegaCoin', icon: 'coin', iconType: 'material-community' }
];

export default class WalletScreen extends React.Component
{
  static navigationOptions =
  {
    title: 'Wallet',
    headerLeft: HeaderLeft,
    headerRight: HeaderRight
  };
  render()
  {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle='light-content'/>
        <LinearGradient colors={['#333333', '#111111']} style={{ alignItems: 'center' }}>
          <TronLogoGraphic style={{ marginTop: 5 }} strokeColor='#ca2b1e' strokeWidth='3' width='100' height='100' />
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30, marginLeft: 15, marginRight: 15 }}>
            <Text style={{ color: '#ffffff', fontSize: 24 }}>6,186.8451 <Text style={{ color: '#ca2b1e', fontSize: 18 }}>TRX</Text></Text>
            <Text style={{ color: '#aaaaaa', fontSize: 16 }}>($632.50)</Text>
          </View>
        </LinearGradient>
        <List containerStyle={{marginTop: 0}}>
        {
          listData.map((item, i) =>
          (
            <ListItem
              key={i}
              title={item.title}
              leftIcon={{name: item.icon, type: item.iconType}}/>
          ))
        }
        </List>
      </SafeAreaView>
    );
  }
}
