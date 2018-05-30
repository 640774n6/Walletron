import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, ScrollView, NativeModules, View, Share, Clipboard } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode';

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';

export default class ReceiveScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    var currentWallet = TronWalletService.getCurrentWallet();
    return {
      title: 'Receive',
      headerRight: (
        <TouchableOpacity onPress={ () => Share.share({ title: currentWallet.name, message: currentWallet.address }) }>
          <Entypo name='share-alternative' size={22} color='#ffffff' style={{ marginRight: 15 }}/>
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      )
    };
  };

  constructor()
  {
    super();

    var initState = {
      walletName: null,
      walletAddress: null
    };

    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    {
      initState.walletName = currentWallet.name;
      initState.walletAddress = currentWallet.address;
    }

    this.state = initState;
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <View style={{ alignItems: 'center', margin: 15 }}>
            <View style={{
              backgroundColor:'#ffffff',
              borderRadius: 10,
              padding: 10,
              marginBottom: 15
            }}>
              <QRCode
                value={ this.state.walletAddress }
                size={180}
                bgColor='#000000'
                fgColor='#ffffff'/>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <BlockieSvg
                  size={14}
                  scale={1.5}
                  seed={ this.state.walletAddress }
                  containerStyle={{
                    overflow: 'hidden',
                    marginRight: 5,
                    borderRadius: 3,
                }}/>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{this.state.walletName}</Text>
              </View>
              <Text style={{ fontSize: 12 }}>{ this.state.walletAddress }</Text>
            </View>
            <TouchableOpacity onPress={ () => Clipboard.setString(this.state.walletAddress) }>
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
