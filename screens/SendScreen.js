import React from 'react';
import { StatusBar, SafeAreaView, Platform, View, Text, TouchableOpacity, TextInput, Dimensions, Clipboard } from 'react-native';
import { ListItem, Icon, Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Foundation, Ionicons, Feather } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TextInputMask from 'react-native-text-input-mask';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import Util from '../libs/Util.js';

export default class SendScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Send',
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      ),
      headerRight: (Platform.OS === 'android' && <View/>)
    };
  };

  adjustFrameTokenDropDown(style) {
    style.top += Platform.OS === 'android' ? -40 : -15;
    style.width = Dimensions.get('window').width - 30;
    style.height = 'auto';
    style.maxHeight = 200;
    return style;
  }

  renderTokenDropDownRow(rowData, rowID, highlighted) {
    return (
      <TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10
        }}>
          <Text style={{ fontSize: 16 }}>{`${rowData.name} (${rowData.balance.toFixed(3)}) available`}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  onSelectTokenDropDown(index, rowData) {
    this.setState({ token: rowData });
  }

  async onRecipientAddressChanged(text) {
    var newRecipient = {
      address: null,
      valid: false
    }

    if(text.length > 0)
    {
      var addressIsValid = await TronWalletService.validateAddress(text);
      newRecipient.address = text;
      newRecipient.valid = addressIsValid;
    }

    this.setState({ recipient: newRecipient });
  }

  onAmountChanged(formatted, extracted) {
    var newAmount = parseFloat(formatted);
    this.setState({ amount: newAmount });
  }

  async onPasteAddress() {
    var pasteAddress = await Clipboard.getString();
    this.recipientAddressTextInput.setNativeProps({ text: pasteAddress });
    this.onRecipientAddressChanged(pasteAddress);
  }

  async onShouldScanAddress() {
    var params = {
      onBarcodeScanned: this.onAddressScanned.bind(this)
    }
    this.props.navigation.navigate({ routeName: 'ScanBarcode', params: params });
  }

  onAddressScanned(address) {
    this.recipientAddressTextInput.setNativeProps({ text: address });
    this.onRecipientAddressChanged(address);
  }

  async onConfirmPress() {
    this.setState({ confirmVisible: false, sendingVisible: true });
    await Util.sleep(1000);

    var result = await TronWalletService.sendAssetFromCurrentWallet(this.state.recipient.address, this.state.token.name, this.state.amount);
    if(result) { this.setState({ sendingVisible: false, successVisible: true }); }
    else { this.setState({ sendingVisible: false, failVisible: true }); }
  }

  onBackToWalletPress() {
    this.setState({ successVisible: false });
    this.props.navigation.pop();
  }

  constructor()
  {
    super();

    var initState = {
      walletName : null,
      walletAddress: null,
      walletReadonly: false,
      token: null,
      tokens: null,
      recipient: {
        address: null,
        valid: false
      },
      amount: 0.0,
      confirmVisible: false,
      sendingVisible: false,
      successVisible: false,
      failVisible: false
    };

    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    {
      var tokens = [{ name: 'TRX', balance: currentWallet.balance }];
      currentWallet.assets.forEach(asset => {
        tokens.push({
          name: asset.name,
          balance: parseFloat(asset.balance)
        });
      });

      initState.walletName = currentWallet.name;
      initState.walletAddress = currentWallet.address;
      initState.walletReadonly = (currentWallet.privateKey === null);

      if(tokens.length > 0)
      {
        initState.tokens = tokens;
        initState.token = tokens[0];
      }
    }

    this.state = initState;
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <KeyboardAwareScrollView contentContainerStyle={{ margin: 15 }} enableOnAndroid={true}>
          <ModalDropdown
            options={ this.state.tokens }
            animated={false}
            showsVerticalScrollIndicator={true}
            onSelect={ this.onSelectTokenDropDown.bind(this) }
            adjustFrame={ this.adjustFrameTokenDropDown.bind(this) }
            renderRow={ this.renderTokenDropDownRow.bind(this) }
            dropdownStyle={{
              borderWidth: 1,
              borderRadius: 8,
              overflow: 'hidden'
            }}>
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              marginBottom: 15,
              padding: 10
            }}>
              <Text style={{
                color: '#000000',
                fontSize: 18,
              }}>Token</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{
                  flex: 1,
                  color: '#777777',
                  fontSize: 16,
                  marginTop: 5
                }}>
                  { `${this.state.token.name} (${this.state.token.balance.toFixed(4)} available)` }
                </Text>
                <MaterialCommunityIcons name='chevron-down' color='#c7c7c7' size={22}/>
              </View>
            </View>
          </ModalDropdown>
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
                }}>Recipient</Text>
                {
                  this.state.recipient.address ?
                    ( this.state.recipient.valid ?
                      <FontAwesome name='check-circle' size={18} color='#1aaa55' style={{ marginLeft: 5 }}/> :
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                        <FontAwesome name='exclamation-circle' size={18} color='#db3b21'/>
                        <Text style={{ fontSize: 14, color: '#db3b21', marginLeft: 5 }}>Invalid address</Text>
                      </View>
                    )
                    : null
                }
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={ this.onPasteAddress.bind(this) }>
                  <FontAwesome name='paperclip' size={22} color='#000000'/>
                </TouchableOpacity>
                <TouchableOpacity onPress={ this.onShouldScanAddress.bind(this) }>
                  <FontAwesome name='qrcode' size={24} color='#000000' style={{ marginLeft: 15 }}/>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={{
                flex: 1,
                color: '#777777',
                fontSize: 16,
                height: 22,
                marginTop: 5
              }}
              ref={ ref => this.recipientAddressTextInput = ref }
              autoCorrect={false}
              returnKeyType={"done"}
              autoCapitalize='none'
              underlineColorAndroid='transparent'
              placeholder='Tron address'
              onChangeText={ (text) => this.onRecipientAddressChanged.bind(this)(text) }/>
          </View>
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
                    ( this.state.amount <= this.state.token.balance ?
                      <FontAwesome name='check-circle' size={18} color='#1aaa55' style={{ marginLeft: 5 }}/> :
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                        <FontAwesome name='exclamation-circle' size={18} color='#db3b21'/>
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
              placeholder={ `Amount of ${this.state.token.name} to send` }
              mask='[09999999999].[9999]'
              onChangeText={ this.onAmountChanged.bind(this) }/>
            <Button
              onPress={ () => this.setState({ confirmVisible: true }) }
              disabled={ (!this.state.recipient.valid ||
                          !this.state.amount ||
                          this.state.amount > this.state.token.balance) }
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
              title='Send'
              icon={{
                name: 'send',
                type: 'font-awesome',
                color: '#ffffff',
                size: 22
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
          <Text style={{ fontSize: 18, marginBottom: 30 }}>Send Confirmation</Text>
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
            <MaterialCommunityIcons name='coins' color='#000000' size={22}/>
            <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>{ `${this.state.amount.toFixed(4)} ${this.state.token.name}` }</Text>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <BlockieSvg
                size={14}
                scale={1.5}
                seed={ this.state.recipient.address }
                containerStyle={{
                  overflow: 'hidden',
                  marginRight: 5,
                  borderRadius: 3,
              }}/>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Recipient</Text>
            </View>
            <Text style={{ fontSize: 12 }}>{ this.state.recipient.address }</Text>
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
        <Overlay visible={this.state.sendingVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Sending</Text>
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
          <Text style={{ fontSize: 18 }}>Send Complete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction successful</Text>
            <Button
              onPress={ this.onBackToWalletPress.bind(this) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
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
          <Text style={{ fontSize: 18 }}>Send Incomplete</Text>
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
