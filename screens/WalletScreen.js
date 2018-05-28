import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, TouchableHighlight, View, Text, ScrollView, Animated, SectionList, NativeModules, Platform } from 'react-native';
import { ListItem, Button, Icon } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient, BarCodeScanner, Permissions } from 'expo';
import ModalDropdown from 'react-native-modal-dropdown';

import NavigationHelper from '../libs/NavigationHelper.js';
import { TronLogoPathGraphic, TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';
import BlockieSvg from '../libs/BlockieSvg.js';

const HEADER_MIN_HEIGHT = 50;
const HEADER_MAX_HEIGHT = 200;
const TEST_WALLET_ADDRESS = '27c1akzkGRZup6DFLtxM5ErfPzAxaJv2dcW';

const SECTIONS = [{
  key: 0,
  title: 'Tokens',
  icon: {
    name: 'coins',
    type: 'material-community',
    color: '#000000'
  },
  content: {
    noneTitle: 'You have no tokens',
    noneMessage: 'Create a new token or participate using the token menu on the right.'
  },
  data: []
},
{
  key: 1,
  title: 'Power',
  icon: {
    name: 'bolt',
    type: 'font-awesome',
    color: '#000000'
  },
  content: {
    noneTitle: 'You have no power',
    noneMessage: 'Freeze balances to gain power using the power menu on the right.'
  },
  data: []
}];

export default class WalletScreen extends React.Component {
  static renderWalletDropDownRow(rowData, rowID, highlighted) {
    return (
      <TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15
        }}>
          <Text style={{ fontSize: 16 }}>{rowData.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  static adjustFrameWalletDropDown(style) {
    style.top += Platform.OS === 'android' ? -15 : 15;
    style.right += 15;
    style.height = 'auto';
    style.maxHeight = 200;
    return style;
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Wallet',
      headerLeft: (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
          <TouchableOpacity onPress={ () => navigation.navigate('Send') }>
            <FontAwesome name='send' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => navigation.navigate('Receive') }>
            <FontAwesome name='qrcode' color='#ffffff' size={24}/>
          </TouchableOpacity>
        </View>
      ),
      headerRight: (
        <ModalDropdown
          options={[
            { name: 'Master Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS },
            { name: 'Test Wallet', address: TEST_WALLET_ADDRESS }
          ]}
          animated={false}
          showsVerticalScrollIndicator={true}
          adjustFrame={ WalletScreen.adjustFrameWalletDropDown.bind(this) }
          renderRow={ WalletScreen.renderWalletDropDownRow.bind(this) }
          dropdownStyle={{
            borderWidth: 0,
            borderRadius: 8,
            overflow: 'hidden'
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <BlockieSvg
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
        </ModalDropdown>
      )
    }
  };

  constructor()
  {
    super();

    this.state = {
      balance: 0.0,
      value: 0.0,
      sections: SECTIONS,
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
    //for(var i = 0; i < 100; i++)
    //{ account.assets.push(account.assets[0]); }

    var sections = this.state.sections;
    sections[0].data = account.assets;

    this.setState({
      balance: trxBalance,
      value: trxValue,
      sections: sections,
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

  renderSectionHeaderItem = ({ section, key}) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name={section.icon.name} type={section.icon.type} size={22} color={ section.icon.color }/>
          <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>{section.title}</Text>
        </View>
        <TouchableOpacity>
          <Entypo
            style={{ marginRight: 10 }}
            name='dots-three-horizontal'
            size={28}
            color='#333333'/>
        </TouchableOpacity>
      </View>
    );
  }

  renderSectionFooterItem = ({section, key}) => {
    if(section.data.length === 0)
    {
      return (
        <View style={{
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          padding: 15,
          marginLeft: 10,
          marginRight: 10,
          marginBottom: section.key === this.state.sections.length - 1 ? 10 : null,
        }}>
          <Text style={{ fontSize: 16, color: '#000000', marginBottom: 5 }}>{ section.content.noneTitle }</Text>
          <Text style={{ fontSize: 14, color: '#777777' }}>{ section.content.noneMessage }</Text>
        </View>
      );
    }
    else
    { return null; }
  }

  renderListItem = ({ item, index, section }) => {
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
          borderBottomLeftRadius: index === section.data.length - 1 ? 8 : null,
          borderBottomRightRadius: index === section.data.length - 1 ? 8 : null,
          backgroundColor: '#ffffff',
          borderBottomColor: index != section.data.length - 1 ? '#dfdfdf' : null,
          borderBottomWidth: index != section.data.length - 1 ? 1 : null,
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
          <SectionList
            keyExtractor={(item, index) => index}
            renderSectionHeader={ this.renderSectionHeaderItem }
            renderSectionFooter={ this.renderSectionFooterItem }
            sections={ this.state.sections }
            renderItem={ this.renderListItem }/>
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
