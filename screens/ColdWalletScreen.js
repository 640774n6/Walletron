import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, TouchableHighlight, View, Text, ScrollView, Animated, FlatList, NativeModules, Platform } from 'react-native';
import { ListItem, Button, Icon } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons, Foundation, Octicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo';
import ModalDropdown from 'react-native-modal-dropdown';
import QRCode from 'react-native-qrcode';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';

import TronWalletService from '../libs/TronWalletService.js';
import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import Util from '../libs/Util.js';

export default class ColdWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    var currentWallet = TronWalletService.getCurrentWallet();
    return {
      title: 'Wallet',
      headerLeft: (
        <View>
          { currentWallet &&
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
              <BlockieSvg
                size={16}
                scale={1.5}
                seed={ currentWallet.address }
                containerStyle={{
                  overflow: 'hidden',
                  borderRadius: 3
              }}/>
            </View>}
        </View>
      ),
      headerRight: (Platform.OS === 'android' && <View/>)
    }
  };

  onBackToWalletPress() {
    this.setState({ successVisible: false, transaction: null });
  }

  async onTransactionScanned(transaction) {
    this.setState({ confirmVisible: true, transaction: transaction });
  }

  onSignTransactionPress() {
    var params = {
      onBarcodeScanned: this.onTransactionScanned.bind(this)
    }
    this.props.navigation.navigate({ routeName: 'ColdScanBarcode', params: params });
  }

  async onConfirmPress() {
    this.setState({ confirmVisible: false, signingVisible: true });
    await Util.sleep(1000);

    var signedTransaction = await TronWalletService.signTransactionFromCurrentWallet(this.state.transaction);
    if(signedTransaction) { this.setState({ signingVisible: false, signedVisible: true, transaction: signedTransaction }); }
    else { this.setState({ signingVisible: false, failVisible: true, transaction: null }); }
  }

  constructor() {
    super();

    var initState = {
      walletName: null,
      walletAddress: null,
      transaction: null,
      confirmVisible: false,
      signingVisible: false,
      signedVisible: false,
      successVisible: false,
      failVisible: false
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
        <LinearGradient
          colors={ ['#333333', '#1b1b1b'] }
          style={{
            alignItems: 'center'
          }}>
          <View style={{
            backgroundColor:'#ffffff',
            borderRadius: 8,
            padding: 8,
            marginBottom: 15
          }}>
            <QRCode
              value={ this.state.walletAddress }
              size={120}
              bgColor='#000000'
              fgColor='#ffffff'/>
          </View>
          <View style={{ alignItems: 'center', marginBottom: 15 }}>
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
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>{this.state.walletName}</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#ffffff', opacity: 0.75 }}>{ this.state.walletAddress }</Text>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={{ marginLeft: 10, marginRight: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <Icon name='md-snow' type='ionicon' size={24} color='#000000'/>
            <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Cold Wallet</Text>
          </View>
          <View style={{ padding: 15, backgroundColor: '#ffffff', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: '#000000', marginBottom: 15 }}>
              Receive and sign transactions using barcodes without exposing
              your private key to the internet.
            </Text>
            <Button
              onPress={ this.onSignTransactionPress.bind(this) }
              buttonStyle={{
                backgroundColor: '#ca2b1e',
                padding: 5
              }}
              containerStyle={{
                borderRadius: 8,
                overflow: 'hidden'
              }}
              title='Sign Transaction'
              icon={{
                name: 'qrcode',
                type: 'font-awesome',
                color: '#ffffff',
                size: 24
              }}/>
          </View>
        </ScrollView>
        <Overlay visible={this.state.confirmVisible}
          closeOnTouchOutside animationType="zoomIn"
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}
          animationDuration={200}
          onClose={ () => this.setState({ confirmVisible: false })}>
          <Text style={{ fontSize: 18, marginBottom: 30 }}>Sign Confirmation</Text>
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
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Foundation name='clipboard-pencil' color='#000000' size={22}/>
            <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>Transaction</Text>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Octicons name='radio-tower' color='#000000' size={24}/>
              <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>Network Broadcast</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#777777' }}>From hot wallet</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <Button
            onPress={ () => this.setState({ confirmVisible: false }) }
            titleStyle={{ fontSize: 16 }}
            buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
            containerStyle={{ borderRadius: 8, overflow: 'hidden', marginRight: 10 }}
            title='Cancel'
            iconContainerStyle={{ marginRight: 0 }}
            icon={{
              name: 'times',
              type: 'font-awesome',
              color: '#ffffff',
              size: 18
            }}/>
            <Button
              onPress={ this.onConfirmPress.bind(this) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Confirm'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'check',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </View>
        </Overlay>
        <Overlay visible={this.state.signingVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Signing</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Progress.Bar color='#ca2b1e' indeterminate={true}/>
            <Text style={{ fontSize: 14, color: '#777777', marginTop: 15 }}>Please wait...</Text>
          </View>
        </Overlay>
        <Overlay visible={this.state.signedVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Broadcast</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <View style={{
              backgroundColor:'#ffffff',
              borderRadius: 8,
              padding: 8,
              marginBottom: 15
            }}>
              <QRCode
                value={ this.state.transaction }
                size={180}
                bgColor='#000000'
                fgColor='#ffffff'/>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Octicons name='radio-tower' color='#000000' size={24}/>
              <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>Network Broadcast</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#777777', marginBottom: 15 }}>
              Scan this barcode with a hot wallet to broadcast the signed transaction.
            </Text>
            <Button
              onPress={ () => this.setState({ signedVisible: false, successVisible: true }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Finish'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'check',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </View>
        </Overlay>
        <Overlay visible={this.state.successVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Complete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction successfully signed</Text>
            <Button
              onPress={ this.onBackToWalletPress.bind(this) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Back to Wallet'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'wallet',
                type: 'entypo',
                color: '#ffffff',
                size: 18
              }}/>
          </View>
        </Overlay>
        <Overlay visible={this.state.failVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Sign Incomplete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-close-circle-outline' color='#db3b21' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Failed to sign transaction</Text>
            <Button
              onPress={ () => this.setState({ failVisible: false }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#db3b21', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Dismiss'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'times',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </View>
        </Overlay>
      </SafeAreaView>
    );
  }
}
