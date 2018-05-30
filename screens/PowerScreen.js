import React from 'react';
import { StatusBar, SafeAreaView, Platform, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { LinearGradient } from 'expo';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons, Octicons } from '@expo/vector-icons';
import Moment from 'moment';

import TronWalletService from '../libs/TronWalletService.js';

export default class PowerScreen extends React.Component
{
    static navigationOptions = ({ navigation }) => {
      return {
      title: 'Power',
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <TouchableOpacity onPress={ () => navigation.navigate('Send') }>
            <Ionicons name='md-snow' color='#ffffff' size={24} style={{ marginRight: 10 }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => navigation.navigate('Receive') }>
            <MaterialCommunityIcons name='fire' color='#ffffff' size={24}/>
          </TouchableOpacity>
        </View>
      )
    }
  }

  scrollToTop()
  {
    this.scrollView.scrollToOffset({ offset: 0, animated: true });
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
        icon={{
          name: ''
        }}
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
      frozen: []
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
      </SafeAreaView>
    );
  }
}
