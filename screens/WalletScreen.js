import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, View, Text, ScrollView, Animated, FlatList, NativeModules } from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient, AppLoading } from 'expo';

import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';
import Blockie from '../libs/blockie.js';

const HEADER_MIN_HEIGHT = 50;
const HEADER_MAX_HEIGHT = 200;
const TEST_WALLET_ADDRESS = '27c1akzkGRZup6DFLtxM5ErfPzAxaJv2dcW';

const headerLeft = (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
    <TouchableOpacity>
      <FontAwesome name='send' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
    </TouchableOpacity>
    <TouchableOpacity>
      <FontAwesome name='qrcode' color='#ffffff' size={24}/>
    </TouchableOpacity>
  </View>
);

const headerRight = (
  <TouchableOpacity>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <Blockie
        size={16}
        scale={1.5}
        seed={TEST_WALLET_ADDRESS}
        containerStyle={{
          overflow: 'hidden',
          marginLeft: 15,
          borderRadius: 3,
      }}/>
      <MaterialCommunityIcons name='chevron-down' color='#ffffff' size={22} style={{ marginLeft: 5 }}/>
    </View>
  </TouchableOpacity>
);

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
      balance: 0.0,
      value: 0.0,
      tokens: [],
      loaded: false
    }

    this.scrollYAnimatedValue = new Animated.Value(0);
  }

  async reloadData() {
    const cryptoCompare = require('cryptocompare');
    var priceData = await cryptoCompare.price('TRX', 'CAD');
    var trxValue = parseFloat(priceData['CAD']);

    const tronClient = NativeModules.TronClient;
    var account = await tronClient.getAccount(TEST_WALLET_ADDRESS);
    var trxBalance = parseFloat(account.balance);

    this.setState({
      balance: trxBalance,
      value: trxValue,
      tokens: account.assets,
      loaded: true });
  }

  refresh() {
    this.reloadData();
    this.setState({ loaded: false });
  }

  componentDidMount() {
    this.reloadData();
  }

  scrollToTop()
  {
    this.scrollView.scrollTo({ y: 0, animated: true });
  }

  renderTokenListItem = ({ item, index }) => {
    return (
      <ListItem
        key={ index }
        title={ item.name }
        titleStyle={{ color: '#000000', fontSize: 16 }}
        leftElement={<Blockie containerStyle={{ borderRadius: 5, overflow: 'hidden' }} size={16} scale={2.0} seed={ item.name }/>}
        rightTitle={ item.balance.toString() }
        rightTitleStyle={{ color: '#000000', fontSize: 18 }}
        hideChevron
        containerStyle={{
          borderTopLeftRadius: index === 0 ? 8 : null,
          borderTopRightRadius: index === 0 ? 8 : null,
          borderBottomLeftRadius: index === this.state.tokens.length - 1 ? 8 : null,
          borderBottomRightRadius: index === this.state.tokens.length - 1 ? 8 : null,
          backgroundColor: '#ffffff',
          borderBottomColor: index != this.state.tokens.length - 1 ? '#dfdfdf' : null,
          borderBottomWidth: index != this.state.tokens.length - 1 ? 1 : null,
          marginLeft: 10,
          marginRight: 10
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
          ref={ ref => this.scrollView = ref }
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
          scrollIndicatorInsets={{ top: HEADER_MAX_HEIGHT }}
          scrollEventThrottle={ 16 }
          onScroll={ Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollYAnimatedValue }}}], { userNativeDriver: true }) }>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name='coins' size={22} color='#333333'/>
              <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Tokens</Text>
            </View>
            <Entypo
              style={{ marginRight: 10 }}
              name='dots-three-horizontal'
              size={28}
              color='#333333'/>
          </View>
          <FlatList
            keyExtractor={(item, index) => item + index}
            renderItem={ this.renderTokenListItem }
            data={ this.state.tokens }/>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name='snowflake-o' size={22} color='#333333'/>
              <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Freezer</Text>
            </View>
            <Entypo
              style={{ marginRight: 10 }}
              name='dots-three-horizontal'
              size={28}
              color='#333333'/>
          </View>
        </ScrollView>
        <Animated.View
          style={{
            height: headerHeight,
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}>
          <LinearGradient
            colors={ ['#333333', '#1b1b1b'] }
            style={{
              flex: 1,
              alignItems: 'center'
            }}>
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
              <Text style={{ color: '#ffffff', fontSize: 22 }}>{ this.state.balance.toFixed(3) } TRX</Text>
              <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 16 }}>(${ (this.state.balance * this.state.value).toFixed(2) })</Text>
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
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 10,
                paddingRight: 10
              }}>
              <TouchableOpacity onPress={ this.scrollToTop.bind(this) }>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <TronLogoLineGraphic
                    style={{
                      width: 35,
                      height: 35,
                      marginRight: 10
                    }}
                    strokeColor='#ca2b1e'
                    strokeWidth='6'/>
                  <View>
                    <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 5 }}>{ this.state.balance.toFixed(3) } TRX</Text>
                    <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 12 }}>(${ (this.state.balance * this.state.value).toFixed(2) })</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }
}
