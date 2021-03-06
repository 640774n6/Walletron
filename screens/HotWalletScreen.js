import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, TouchableHighlight, View, Text, ScrollView, Animated, FlatList, NativeModules, Platform } from 'react-native';
import { ListItem, Button, Icon } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo';
import ModalDropdown from 'react-native-modal-dropdown';

import TronWalletService from '../libs/TronWalletService.js';
import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';
import BlockieSvg from '../libs/BlockieSvg.js';

const HEADER_MIN_HEIGHT = 50;
const HEADER_MAX_HEIGHT = 200;

export default class HotWalletScreen extends React.Component {
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
      headerRight: (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <TouchableOpacity onPress={ () => navigation.navigate('Send') }>
            <FontAwesome name='send' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => navigation.navigate('Receive') }>
            <FontAwesome name='qrcode' color='#ffffff' size={24}/>
          </TouchableOpacity>
        </View>
      )
    }
  };

  constructor()
  {
    super();

    var initState = {
      address: null,
      name: null,
      balance: 0.0,
      bandwidth: 0.0,
      value: 0.0,
      tokens: []
    }

    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    {
      var tokens = currentWallet.assets.map(asset => {
        return {
          name: asset.name,
          balance: parseFloat(asset.balance)
        };
      });

      initState.address = currentWallet.address;
      initState.name = currentWallet.name;
      initState.balance = parseFloat(currentWallet.balance),
      initState.tokens = tokens;
    }

    this.state = initState;
    this.scrollYAnimatedValue = new Animated.Value(0);
  }

  async updateCurrentPriceValue()
  {
    const cryptoCompare = require('cryptocompare');
    var priceData = await cryptoCompare.price('TRX', 'CAD');
    if(priceData)
    {
      var trxValue = parseFloat(priceData['CAD']);
      this.setState({ value: trxValue });
    }
  }

  async updateCurrentWallet() {
    var updated = await TronWalletService.updateCurrentWallet();
    if(updated)
    {
      var currentWallet = TronWalletService.getCurrentWallet();
      if(currentWallet)
      {
        var tokens = currentWallet.assets.map(asset => {
          return {
            name: asset.name,
            balance: parseFloat(asset.balance)
          };
        });

        this.setState({
          address: currentWallet.address,
          name: currentWallet.name,
          balance: parseFloat(currentWallet.balance),
          tokens: tokens
        });
      }
    }
  }

  refresh() {
    this.updateCurrentPriceValue();
    this.updateCurrentWallet();
  }

  componentDidMount() {
    this.refresh();
  }

  scrollToTop()
  {
    this.scrollView.scrollTo({ y: 0, animated: true });
  }

  renderListHeader() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name='coins' type='material-community' size={24} color='#000000'/>
          <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Tokens</Text>
        </View>
      </View>
    );
  }

  renderListEmpty() {
    return (
      <View style={{
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
      }}>
        <Text style={{ fontSize: 16, color: '#000000', marginBottom: 5 }}>You have no tokens</Text>
        <Text style={{ fontSize: 14, color: '#777777' }}>Participate or create tokens</Text>
      </View>
    );
  }

  renderListItem({item, index}) {
    return (
      <ListItem
        key={ index }
        title={ item.name }
        titleStyle={{ color: '#000000', fontSize: 16 }}
        leftAvatar={{ rounded: true, title: item.name.toUpperCase().charAt(0) }}
        rightTitle={ item.balance.toString() }
        rightTitleStyle={{ color: '#000000', fontSize: 16 }}
        hideChevron
        containerStyle={{
          borderTopLeftRadius: index === 0 ? 8 : null,
          borderTopRightRadius: index === 0 ? 8 : null,
          borderBottomLeftRadius: index === this.state.tokens.length - 1 ? 8 : null,
          borderBottomRightRadius: index === this.state.tokens.length - 1 ? 8 : null,
          backgroundColor: '#ffffff',
          borderBottomColor: index != this.state.tokens.length - 1 ? '#dfdfdf' : null,
          borderBottomWidth: index != this.state.tokens.length - 1 ? 1 : null,
          marginBottom: index === this.state.tokens.length - 1 ? 10 : null,
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
          <FlatList
            keyExtractor={ (item, index) => index.toString() }
            ListHeaderComponent={ this.renderListHeader.bind(this) }
            ListEmptyComponent={ this.renderListEmpty.bind(this) }
            data={ this.state.tokens }
            renderItem={ this.renderListItem.bind(this) }/>
        </ScrollView>
        <Animated.View
          style={{
            height: headerHeight,
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
              <Text style={{ color: '#ffffff', fontSize: 22 }}>
                { this.state.balance.toFixed(4) } TRX
              </Text>
              <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 18 }}>
                (${ (this.state.balance * this.state.value).toFixed(2) })
              </Text>
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
                    <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 5 }}>
                      { this.state.balance.toFixed(4) } TRX
                    </Text>
                    <Text style={{ color: '#ffffff', opacity: 0.75, fontSize: 12 }}>
                      (${ (this.state.balance * this.state.value).toFixed(2) })
                    </Text>
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
