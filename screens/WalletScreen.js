import React from 'react';
import { StatusBar, SafeAreaView, View, Text, ScrollView, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient, AppLoading } from 'expo';
import { HttpClient } from '@tronprotocol/wallet-api';

import TronLogoGraphic from '../graphics/TronLogoGraphic.js';

const headerRight = (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <FontAwesome name='send' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
    <FontAwesome name='qrcode' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
  </View>
);

const headerLeft = (
  <FontAwesome name='bars' color='#ffffff' size={20} style={{ marginLeft: 15 }}/>
);

const HEADER_MIN_HEIGHT = 50;
const HEADER_MAX_HEIGHT = 200;

export default class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
    headerLeft: headerLeft,
    headerRight: headerRight
  };

  constructor()
  {
    super();

    this.state = {
      balance: '0.000',
      value: '0.00',
      tokens: [],
      loaded: false
    }

    this.scrollYAnimatedValue = new Animated.Value(0);
  }

  async reloadData() {
    const tronClient = new HttpClient();
    const cryptoCompare = require('cryptocompare');

    var accountBalances = await tronClient.getAccountBalances('27c1akzkGRZup6DFLtxM5ErfPzAxaJv2dcW');
    var priceData = await cryptoCompare.price('TRX', 'CAD');

    var trxBalance = parseFloat(accountBalances.balances[0].balance).toFixed(3);
    var trxValue = parseFloat(trxBalance * priceData['CAD']).toFixed(2);

    accountBalances.balances.shift();
    var tokens = accountBalances.balances.map(b => {
      return {
        name: b.name,
        balance: parseInt(b.balance)
      };
    });

    this.setState({
      balance: trxBalance,
      value: trxValue,
      tokens: tokens,
      loaded: true });
  }

  refresh() {
    this.reloadData();
    this.setState({ loaded: false });
  }

  componentDidMount() {
    this.reloadData();
  }

  render() {
    const headerHeight = this.scrollYAnimatedValue.interpolate({
      inputRange: [ 0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) ],
      outputRange: [ HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT ],
      extrapolate: 'clamp'
    });

    const largeHeaderContentOpacity = this.scrollYAnimatedValue.interpolate({
      inputRange: [ 0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT*2) ],
      outputRange: [ 1.0, 0.0 ],
      extrapolate: 'clamp'
    });

    const smallHeaderContentOpacity = this.scrollYAnimatedValue.interpolate({
      inputRange: [ (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT*2), ( HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT ) ],
      outputRange: [ 0.0, 1.0 ],
      extrapolate: 'clamp'
    });

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
          scrollIndicatorInsets={{ top: HEADER_MAX_HEIGHT }}
          scrollEventThrottle={ 16 }
          onScroll={ Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollYAnimatedValue }}}], { userNativeDriver: true }) }>
          <List containerStyle={{
            marginTop: 0,
            marginBottom: 10,
            backgroundColor: null,
            borderColor: null,
            borderTopWidth: 0
          }}>
          { this.state.tokens.map((token, i) => (
              <ListItem
                key={ i }
                title={ token.name }
                titleStyle={{ color: '#000000', fontSize: 16 }}
                leftIcon={{ name: 'coins', color: '#ca2b1e', type: 'material-community' }}
                badge={{ value: token.balance, containerStyle: { backgroundColor: '#777777' } }}
                hideChevron
                containerStyle={{
                  borderRadius: 8,
                  margin: 10,
                  marginBottom: 0,
                  borderBottomWidth: 0,
                  backgroundColor: '#ffffff'
                }}/>
            ))
          }
          </List>
        </ScrollView>
        <Animated.View
          style={{
            height: headerHeight,
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}>
          <LinearGradient colors={ ['#333333', '#1b1b1b'] } style={{ flex: 1, alignItems: 'center' }}>
            <Animated.View style={{ flex: 1, alignItems: 'center', opacity: largeHeaderContentOpacity }}>
              <TronLogoGraphic style={{ aspectRatio: 1.0, flex: 1, marginTop: 5 }} strokeColor='#ca2b1e' strokeWidth='3'/>
              <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30, marginLeft: 15, marginRight: 15 }}>
                <Text style={{ color: '#ffffff', fontSize: 22 }}>{ this.state.balance } TRX</Text>
                <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 16 }}>(${ this.state.value })</Text>
              </View>
            </Animated.View>
            <Animated.View
              style={{
                opacity: smallHeaderContentOpacity,
                height: HEADER_MIN_HEIGHT,
                position: 'absolute',
                bottom: 5,
                left: 0,
                right: 0,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 10,
                paddingRight: 10
              }}>
              <TronLogoGraphic style={{ width: 35, height: 35, marginRight: 10 }} strokeColor='#ca2b1e' strokeWidth='4'/>
              <View>
                <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 5 }}>{ this.state.balance } TRX</Text>
                <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 12 }}>(${ this.state.value })</Text>
              </View>
            </Animated.View>
            <MaterialCommunityIcons
              style={{
                marginRight: 10,
                position: 'absolute',
                bottom: 10,
                right: 0
              }}
              name='plus-circle-multiple-outline'
              color='#ffffff'
              size={28}/>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }
}
