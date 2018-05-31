import React from 'react';
import { StatusBar, SafeAreaView, Platform, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { LinearGradient } from 'expo';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';
import Moment from 'moment';

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import Util from '../libs/Util.js';

export default class PowerScreen extends React.Component
{
    static navigationOptions = ({ navigation }) => {
      return {
      title: 'Power',
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <TouchableOpacity onPress={ navigation.state.params ? navigation.state.params.onUnfreezePress : null }>
            <MaterialCommunityIcons name='fire' color='#ffffff' size={24} style={{ marginRight: 15 }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => navigation.navigate('Freeze') }>
            <Ionicons name='md-snow' color='#ffffff' size={24}/>
          </TouchableOpacity>
        </View>
      )
    }
  }

  async onConfirmPress() {
    this.setState({ unfreezeConfirmVisible: false, unfreezingVisible: true });
    await Util.sleep(1000);

    var result = await TronWalletService.unfreezeBalanceFromCurrentWallet();
    if(result) { this.setState({ unfreezingVisible: false, unfreezeSuccessVisible: true }); }
    else { this.setState({ unfreezingVisible: false, unfreezeFailVisible: true }); }
  }

  onUnfreezePress() {
    this.setState({ unfreezeConfirmVisible: true });
  }

  renderListHeader() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name='md-snow' type='ionicon' size={24} color='#000000'/>
          <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Frozen Funds</Text>
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
        <Text style={{ fontSize: 16, color: '#000000', marginBottom: 5 }}>You have no frozen balances</Text>
        <Text style={{ fontSize: 14, color: '#777777' }}>Freeze balances to gain power and increase bandwidth</Text>
      </View>
    );
  }

  renderListItem({item, index}) {
    return (
      <ListItem
        key={ index }
        title={ item.balance.toString() + ' TRX' }
        titleStyle={{ color: '#000000', fontSize: 16 }}
        rightTitle={ Moment(item.expireTime).format('MM/DD/YYYY h:mm A') }
        rightTitleStyle={{ color: '#777777', fontSize: 16, textAlign: 'right' }}
        hideChevron
        containerStyle={{
          borderTopLeftRadius: index === 0 ? 8 : null,
          borderTopRightRadius: index === 0 ? 8 : null,
          borderBottomLeftRadius: index === this.state.frozen.length - 1 ? 8 : null,
          borderBottomRightRadius: index === this.state.frozen.length - 1 ? 8 : null,
          backgroundColor: '#ffffff',
          borderBottomColor: index != this.state.frozen.length - 1 ? '#dfdfdf' : null,
          borderBottomWidth: index != this.state.frozen.length - 1 ? 1 : null,
          marginBottom: index === this.state.frozen.length - 1 ? 10 : null,
          marginLeft: 10,
          marginRight: 10
        }}/>
    );
  }

  constructor()
  {
    super();

    var initState = {
      address: null,
      name: null,
      frozen: [],
      frozenTotal: null,
      bandwidth: null,
      unfreezeConfirmVisible: false,
      unfreezingVisible: false,
      unfreezeSuccessVisible: false,
      unfreezeFailVisible: false
    };

    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    {
      var frozenBalances = currentWallet.frozen.map(frozenBalance => {
        return {
          balance: parseFloat(frozenBalance.balance),
          expireTime: new Date(frozenBalance.expireTime)
        };
      });

      initState.address = currentWallet.address;
      initState.name = currentWallet.name;
      initState.frozen = frozenBalances;
      initState.frozenTotal = currentWallet.frozenTotal;
      initState.bandwidth = currentWallet.bandwidth.netLimit;
    }

    this.state = initState;
  }

  componentDidMount() {
    this.props.navigation.setParams({ onUnfreezePress: this.onUnfreezePress.bind(this) });
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <View style={{ height: 50, backgroundColor: '#ffffff' }}>
          <LinearGradient
            colors={ ['#333333', '#1b1b1b'] }
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name='bolt' color='#ffc107' size={26}/>
                <Text style={{ fontSize: 18, color: '#ffffff', marginLeft: 5, marginRight: 15 }}>{ this.state.frozenTotal }</Text>
                <Octicons name='dashboard' color='#66cc00' size={24}/>
                <Text style={{ fontSize: 18, color: '#ffffff', marginLeft: 5 }}>{ this.state.bandwidth }</Text>
              </View>
            </LinearGradient>
        </View>
        <FlatList
          ref={ ref => this.scrollView = ref }
          style={{ flex: 1 }}
          removeClippedSubviews={ Platform.OS === 'android' }
          windowSize={ 31 }
          initialNumToRender={ 4 }
          keyExtractor={ (item, index) => index.toString() }
          ListHeaderComponent={ this.renderListHeader.bind(this) }
          ListEmptyComponent={ this.renderListEmpty.bind(this) }
          data={ this.state.frozen }
          renderItem={ this.renderListItem.bind(this) }/>
        <Overlay visible={this.state.unfreezeConfirmVisible}
          closeOnTouchOutside animationType="zoomIn"
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}
          animationDuration={200}
          onClose={ () => this.setState({ unfreezeConfirmVisible: false })}>
          <Text style={{ fontSize: 18, marginBottom: 30 }}>Unfreeze Confirmation</Text>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Ionicons name='md-snow' color='#000000' size={24}/>
              <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>Frozen Funds</Text>
            </View>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name='coins' color='#000000' size={22}/>
            <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>{ `${this.state.frozenTotal.toFixed(4)} TRX` }</Text>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <BlockieSvg
                size={14}
                scale={1.5}
                seed={ this.state.address }
                containerStyle={{
                  overflow: 'hidden',
                  marginRight: 5,
                  borderRadius: 3,
              }}/>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{this.state.name}</Text>
            </View>
            <Text style={{ fontSize: 12 }}>{ this.state.address }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Button
              onPress={ () => this.setState({ unfreezeConfirmVisible: false }) }
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
        <Overlay visible={this.state.unfreezingVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Unfreezing</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Progress.Bar color='#ca2b1e' indeterminate={true}/>
            <Text style={{ fontSize: 14, color: '#777777', marginTop: 15 }}>Please wait...</Text>
          </View>
        </Overlay>
        <Overlay visible={this.state.unfreezeSuccessVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Unfreeze Complete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction successful</Text>
            <Button
              onPress={ () => this.setState({ unfreezeSuccessVisible: false }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Back to Power'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'bolt',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </View>
        </Overlay>
        <Overlay visible={this.state.unfreezeFailVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Unfreeze Incomplete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-close-circle-outline' color='#db3b21' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction failed</Text>
            <Button
              onPress={ () => this.setState({ unfreezeFailVisible: false }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
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
