import React from 'react';
import { StatusBar, SafeAreaView, Platform, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon, ListItem } from 'react-native-elements';
import { LinearGradient } from 'expo';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TextInputMask from 'react-native-text-input-mask';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';
import Moment from 'moment';

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import Util from '../libs/Util.js';

export default class FreezeScreen extends React.Component
{
    static navigationOptions = ({ navigation }) => {
      return {
      title: 'Freeze',
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      ),
      headerRight: (Platform.OS === 'android' && <View/>),
    }
  }

  onAmountChanged(formatted, extracted) {
    var newAmount = parseFloat(formatted);
    this.setState({ amount: newAmount });
  }

  async onConfirmPress() {
    this.setState({ confirmVisible: false, freezingVisible: true });
    await Util.sleep(1000);

    var result = await TronWalletService.freezeBalanceFromCurrentWallet(this.state.amount, 3);
    if(result) { this.setState({ freezingVisible: false, successVisible: true }); }
    else { this.setState({ freezingVisible: false, failVisible: true }); }
  }

  onBackToPowerPress() {
    this.setState({ successVisible: false });
    this.props.navigation.pop();
  }

  constructor()
  {
    super();

    var initState = {
      name: null,
      address: null,
      balance: 0.0,
      amount: 0.0,
      confirmVisible: false,
      freezingVisible: false,
      successVisible: false,
      failVisible: false
    };

    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    {
      initState.name = currentWallet.name;
      initState.address = currentWallet.address;
      initState.balance = currentWallet.balance;
    }

    this.state = initState;
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <KeyboardAwareScrollView contentContainerStyle={{ margin: 15 }} enableOnAndroid={true}>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            marginBottom: 15,
            padding: 10
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{
                  color: '#000000',
                  fontSize: 18
                }}>Amount</Text>
                {
                  this.state.amount ?
                    ( this.state.amount <= this.state.balance ?
                      <FontAwesome name='check-circle' size={18} color='#1aaa55' style={{ marginLeft: 5 }}/> :
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name='exclamation-circle' size={18} color='#db3b21' style={{ marginLeft: 5 }}/>
                        <Text style={{ fontSize: 14, color: '#db3b21', marginLeft: 5 }}>Exceeds available balance</Text>
                      </View>
                    )
                    : null
                }
              </View>
            </View>
            <TextInputMask
              style={{
                flex: 1,
                color: '#777777',
                fontSize: 16,
                height: 22,
                marginTop: 5
              }}
              refInput={ ref => this.amountTextInput = ref }
              autoCorrect={false}
              returnKeyType={"done"}
              autoCapitalize='none'
              underlineColorAndroid='transparent'
              keyboardType='numeric'
              placeholder={ `Amount of TRX to freeze` }
              mask='[09999999999]'
              onChangeText={ this.onAmountChanged.bind(this) }/>
            <Button
              onPress={ () => this.setState({ confirmVisible: true }) }
              disabled={ (!this.state.amount ||
                          this.state.amount > this.state.balance) }
              buttonStyle={{
                backgroundColor: '#1aaa55',
                padding: 5
              }}
              disabledStyle={{
                backgroundColor: '#bbbbbb',
                padding: 5
              }}
              containerStyle={{
                borderRadius: 8,
                overflow: 'hidden',
                marginTop: 15
              }}
              title='Freeze'
              icon={{
                name: 'md-snow',
                type: 'ionicon',
                color: '#ffffff',
                size: 24
              }}/>
          </View>
        </KeyboardAwareScrollView>
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
          <Text style={{ fontSize: 18, marginBottom: 30 }}>Freeze Confirmation</Text>
          <View style={{ alignItems: 'center' }}>
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
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name='coins' color='#000000' size={22}/>
            <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>{ `${this.state.amount.toFixed(4)} TRX` }</Text>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Ionicons name='md-snow' color='#000000' size={24}/>
              <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>Frozen Funds</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#777777' }}>Frozen for at least 3 days</Text>
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
        <Overlay visible={this.state.freezingVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Freezing</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Progress.Bar color='#ca2b1e' indeterminate={true}/>
            <Text style={{ fontSize: 14, color: '#777777', marginTop: 15 }}>Please wait...</Text>
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
          <Text style={{ fontSize: 18 }}>Freeze Complete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction successful</Text>
            <Button
              onPress={ this.onBackToPowerPress.bind(this) }
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
          <Text style={{ fontSize: 18 }}>Freeze Incomplete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-close-circle-outline' color='#db3b21' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction failed</Text>
            <Button
              onPress={ () => this.setState({ failVisible: false }) }
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
