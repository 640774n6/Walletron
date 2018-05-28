import React from 'react';
import { StatusBar, SafeAreaView, Platform, View, Text, TouchableOpacity, TextInput, Dimensions, NativeModules, Clipboard } from 'react-native';
import { ListItem, Icon, Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Foundation } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TextInputMask from 'react-native-text-input-mask';
import {BigNumber} from 'bignumber.js';

export default class SendScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Send',
      headerRight: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginRight: 15 }}/>
        </TouchableOpacity>
      )
    };
  };

  adjustFrameBalanceDropDown(style) {
    style.top += Platform.OS === 'android' ? -40 : -15;
    style.width = Dimensions.get('window').width - 30;
    style.height = 'auto';
    style.maxHeight = 200;
    return style;
  }

  renderBalanceDropDownRow(rowData, rowID, highlighted) {
    return (
      <TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10
        }}>
          <Text style={{ fontSize: 14 }}>{`${rowData.name} (${rowData.balance.toFixed(3)}) available`}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  async onRecipientAddressChanged(text) {
    var newRecipient = {
      address: null,
      valid: false
    }

    if(text.length > 0)
    {
      const tronClient = NativeModules.TronClient;
      var addressIsValid = await tronClient.validateAddress(text);
      newRecipient.address = text;
      newRecipient.valid = addressIsValid;
    }

    this.setState({ recipient: newRecipient });
  }

  onPasteAddress = async() =>
  {
    var pasteAddress = await Clipboard.getString();
    this.recipientAddressTextInput.props.onChangeText(pasteAddress);
  }

  onAmountChanged = (formatted, extracted) =>  {
    var newAmount = parseFloat(formatted);
    this.setState({ amount: newAmount });
  }

  constructor()
  {
    super();
    this.state = {
      token: { name: 'TRX', balance: 10.032 },
      recipient: {
        address: null,
        valid: false
      },
      amount: 0.0
    }
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            margin: 15
          }}
          enableOnAndroid={true}>
          <ModalDropdown
            options={[
              { name: 'TRX', balance: 10.032 }
            ]}
            animated={false}
            showsVerticalScrollIndicator={true}
            adjustFrame={ this.adjustFrameBalanceDropDown.bind(this) }
            renderRow={ this.renderBalanceDropDownRow.bind(this) }
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
                fontSize: 16,
              }}>Token</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{
                  flex: 1,
                  color: '#777777',
                  fontSize: 14,
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
                  fontSize: 16
                }}>Recipient Address</Text>
                {
                  this.state.recipient.address ?
                    (this.state.recipient.valid ?
                      <FontAwesome name='check-circle' size={16} color='#1aaa55' style={{ marginLeft: 5 }}/> :
                      <FontAwesome name='exclamation-circle' size={16} color='#db3b21' style={{ marginLeft: 5 }}/>)
                    : null
                }
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={ this.onPasteAddress.bind(this) }>
                  <Foundation name='paperclip' size={22} color='#000000'/>
                </TouchableOpacity>
                <TouchableOpacity>
                  <FontAwesome name='qrcode' size={22} color='#000000' style={{ marginLeft: 10 }}/>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={{
                flex: 1,
                color: '#777777',
                fontSize: 14,
                height: 22,
                marginTop: 5
              }}
              ref={ ref => this.recipientAddressTextInput = ref }
              autoCorrect={false}
              returnKeyType={"done"}
              autoCapitalize='none'
              underlineColorAndroid='transparent'
              placeholder='Tron address'
              onChangeText={ (text) => this.onRecipientAddressChanged.bind(this)(text) }
              value={ this.state.recipient.address }/>
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
                  fontSize: 16
                }}>Amount</Text>
                {
                  this.state.amount ?
                    (this.state.amount <= this.state.token.balance ?
                      <FontAwesome name='check-circle' size={16} color='#1aaa55' style={{ marginLeft: 5 }}/> :
                      <FontAwesome name='exclamation-circle' size={16} color='#db3b21' style={{ marginLeft: 5 }}/>)
                    : null
                }
              </View>
            </View>
            <TextInputMask
              style={{
                flex: 1,
                color: '#777777',
                fontSize: 14,
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
              onChangeText={ this.onAmountChanged.bind(this) }
              value={ this.state.amount }/>
          </View>
          <Button
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
              overflow: 'hidden'
            }}
            touchableComponent={(<TouchableOpacity/>)}
            title='Send'
            icon={{
              name: 'send',
              type: 'font-awesome',
              color: '#ffffff',
              size: 22
            }}/>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}
