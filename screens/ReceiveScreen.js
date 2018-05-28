import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, ScrollView, NativeModules, View, Share, Clipboard } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode';

import BlockieSvg from '../libs/BlockieSvg.js';
import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';

const TEST_WALLET_ADDRESS = '27c1akzkGRZup6DFLtxM5ErfPzAxaJv2dcW';

export default class ReceiveScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Receive',
      headerLeft: (
        <TouchableOpacity onPress={ () => Share.share({ title: 'Master Wallet', message: TEST_WALLET_ADDRESS }) }>
          <Entypo name='share-alternative' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginRight: 15 }}/>
        </TouchableOpacity>
      )
    };
  };

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <View style={{ alignItems: 'center', margin: 15 }}>
            <View style={{
              flexDirection: 'row',
              marginBottom: 15
            }}>
              <BlockieSvg
                size={16}
                scale={1.5}
                seed={TEST_WALLET_ADDRESS}
                containerStyle={{
                  overflow: 'hidden',
                  marginRight: 5,
                  borderRadius: 3,
              }}/>
              <Text style={{ fontSize: 18 }}>Master Wallet</Text>
            </View>
            <View style={{
              backgroundColor:'#ffffff',
              borderRadius: 10,
              padding: 10,
              marginBottom: 15
            }}>
              <QRCode
                value={TEST_WALLET_ADDRESS}
                size={180}
                bgColor='#000000'
                fgColor='#ffffff'/>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5
             }}>
            <TronLogoLineGraphic
              style={{
                width: 25,
                height: 25,
                marginRight: 5
              }}
              strokeColor='#ca2b1e'
              strokeWidth='8'/>
              <Text style={{ fontSize: 16 }}>Tron Address</Text>
            </View>
            <Text style={{ fontSize: 14, textDecorationLine: 'underline' }}>{TEST_WALLET_ADDRESS}</Text>
            <TouchableOpacity onPress={ () => Clipboard.setString(TEST_WALLET_ADDRESS) }>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#ca2b1e',
                marginTop: 15,
                padding: 10,
                borderRadius: 8
              }}>
                <MaterialIcons
                  name='content-copy'
                  color='#ffffff'
                  backgroundColor='#ca2b1e'
                  size={22}/>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  marginLeft: 5
                }}>Copy Address</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
