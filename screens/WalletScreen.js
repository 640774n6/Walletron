import React from 'react';
import { StatusBar, SafeAreaView, View, Text, ScrollView, Animated, FlatList } from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient, AppLoading } from 'expo';
import { HttpClient } from '@tronprotocol/wallet-api';

import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';
import Blockie from '../support/Blockie.js';

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
      frozen: [],
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
      frozen: accountBalances.frozen.balances,
      loaded: true });
  }

  refresh() {
    this.reloadData();
    this.setState({ loaded: false });
  }

  componentDidMount() {
    this.reloadData();
  }

  renderTokenListItem = ({ item, i }) => {
    return (
      <ListItem
        key={ i }
        title={ item.name }
        titleStyle={{ color: '#000000', fontSize: 16 }}
        leftElement={<Blockie size={16} scale={2.0} seed={ item.name }/>}
        rightTitle={ item.balance.toString() }
        hideChevron
        containerStyle={{
          borderRadius: 8,
          margin: 10,
          marginBottom: 0,
          borderBottomWidth: 0,
          backgroundColor: '#ffffff'
        }}/>
    );
  }

  render() {
    const headerHeight = this.scrollYAnimatedValue.interpolate({
      inputRange: [ 0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) ],
      outputRange: [ HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT ],
      extrapolate: 'clamp'
    });

    const largeHeaderContentValue = this.scrollYAnimatedValue.interpolate({
      inputRange: [ 0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT*2) ],
      outputRange: [ 1.0, 0.0 ],
      extrapolate: 'clamp'
    });

    const smallHeaderContentValue = this.scrollYAnimatedValue.interpolate({
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 10, marginTop: 10, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name='coins' size={28} color='#333333'/>
              <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Tokens</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              style={{ marginRight: 10 }}
              name='swap-horizontal'
              size={28}
              color='#0f7acc'/>
              <MaterialCommunityIcons
                name='plus-circle-multiple-outline'
                size={28}
                color='#1aaa55'/>
            </View>
          </View>
          <FlatList
            style={{ marginBottom: 10 }}
            keyExtractor={(item, index) => item + index}
            renderItem={ this.renderTokenListItem }
            data={ this.state.tokens }/>
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
            <TronLogoLineGraphic
              style={{
                marginTop: 5,
                width: 110,
                height: 110,
                transform: [{ scale: largeHeaderContentValue }],
                opacity: largeHeaderContentValue
              }}
              strokeColor='#ca2b1e'
              strokeWidth='3'/>
            <Animated.View style={{
              opacity: largeHeaderContentValue,
              alignItems: 'center',
              position: 'absolute',
              bottom: 15,
              left: 15,
              right: 15}}>
              <Text style={{ color: '#ffffff', fontSize: 22 }}>{ this.state.balance } TRX</Text>
              <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 16 }}>(${ this.state.value })</Text>
            </Animated.View>
            <Animated.View
              style={{
                opacity: smallHeaderContentValue,
                height: HEADER_MIN_HEIGHT,
                position: 'absolute',
                bottom: 5,
                left: 0,
                right: 0,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 10,
                paddingRight: 10
              }}>
              <TronLogoLineGraphic
                style={{
                  width: 35,
                  height: 35,
                  marginRight: 10
                }}
                strokeColor='#ca2b1e'
                strokeWidth='6'/>
              <View>
                <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 5 }}>{ this.state.balance } TRX</Text>
                <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 12 }}>(${ this.state.value })</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }
}
