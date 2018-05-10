import React from 'react';
import { StatusBar, SafeAreaView, View, Text, ScrollView } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo';

import TronLogoGraphic from '../graphics/TronLogoGraphic.js';

const headerRight = (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <FontAwesome name='send' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
    <FontAwesome name='qrcode' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
  </View>
);

const headerLeft = (
  <FontAwesome name='bars' color='#ffffff' size={22} style={{ marginLeft: 15 }}/>
);

const listData = [
  { title: 'Awesome Token', balance: '100.2345', icon: 'coins', iconType: 'material-community' },
  { title: 'Awesome Token', balance: '100.2345', icon: 'coins', iconType: 'material-community' },
  { title: 'Awesome Token', balance: '100.2345', icon: 'coins', iconType: 'material-community' },
  { title: 'Awesome Token', balance: '100.2345', icon: 'coins', iconType: 'material-community' },
  { title: 'Awesome Token', balance: '100.2345', icon: 'coins', iconType: 'material-community' },
  { title: 'Awesome Token', balance: '100.2345', icon: 'coins', iconType: 'material-community' }
];

export default class WalletScreen extends React.Component
{
  static navigationOptions =
  {
    title: 'Wallet',
    headerLeft: headerLeft,
    headerRight: headerRight
  };
  render()
  {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle='light-content'/>
        <LinearGradient colors={['#333333', '#111111']} style={{ alignItems: 'center' }}>
          <TronLogoGraphic style={{ marginTop: 5 }} strokeColor='#ca2b1e' strokeWidth='3' width='100' height='100' />
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30, marginLeft: 15, marginRight: 15 }}>
            <Text style={{ color: '#ffffff', fontSize: 24 }}>6,186.8451 TRX</Text>
            <Text style={{ color: '#aaaaaa', fontSize: 16 }}>($632.50)</Text>
          </View>
        </LinearGradient>
        <ScrollView style={{ flex: 1}}>
          <List containerStyle={{marginTop: -1, marginBottom: -1}}>
          {
            listData.map((item, i) =>
            (
              <ListItem
                key={i}
                title={item.title}
                leftIcon={{name: item.icon, color: '#ca2b1e', type: item.iconType}}
                rightTitle={item.balance}
                rightTitleStyle={{ color: '#000000' }}
                hideChevron/>
            ))
          }
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
