import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, TextInput, ScrollView, NativeModules, Platform, View, Dimensions } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Button } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ModalDropdown from 'react-native-modal-dropdown';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import Util from '../libs/Util.js';

export default class CreateWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Create Wallet',
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      ),
      headerRight: (Platform.OS === 'android' && <View/>)
    };
  };

  adjustFrameTypeDropDown(style) {
    style.top += Platform.OS === 'android' ? -40 : -15;
    style.width = Dimensions.get('window').width - 30;
    style.height = 'auto';
    style.maxHeight = 200;
    return style;
  }

  renderTypeDropDownRow(rowData, rowID, highlighted) {
    return (
      <TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10
        }}>
          <Text style={{ fontSize: 16 }}>{ rowData.name }</Text>
        </View>
      </TouchableOpacity>
    );
  }

  onSelectTypeDropDown(index, rowData) {
    this.setState({ type: rowData });
  }

  onNameChanged(text) {
    var nameTaken = false;
    if(text.length > 0)
    { nameTaken = TronWalletService.walletExistsWithName(text); }

    this.setState({ name: text, nameAvailable: !nameTaken });
  }

  async onCreatePress() {
    this.setState({ generatingVisible: true });
    await Util.sleep(1000);

    var generatedAccount = await TronWalletService.generateAccount(this.state.passphrase);
    if(generatedAccount)
    {
      var newWallet = {
        name: this.state.name,
        address: generatedAccount.address,
        privateKey: generatedAccount.privateKey,
        balance: 0.0,
        assets: [],
        type: this.state.type.key,
        timestamp: null
      }

      TronWalletService.addWallet(newWallet);
      TronWalletService.setCurrentWalletByName(newWallet.name);
      await TronWalletService.save();

      this.setState({
        account: generatedAccount,
        generatingVisible: false,
        generatedVisible: true
      });
    }
    else {
      this.setState({
        generatingVisible: false,
        failVisible: true
      });
    }
  }

  constructor()
  {
    super();

    var initState = {
      name: null,
      nameAvailable: false,
      type: { key: 0, name: 'Hot wallet' },
      passphrase: null,
      account: {
        address: null,
        privateKey: null,
        mnemonics: null
      },
      generatingVisible: false,
      generatedVisible: false,
      seedBackupVisible: false,
      privateKeyBackupVisible: false,
      successVisible: false,
      failVisible: false
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
                }}>Name</Text>
                {
                  this.state.name ?
                    (this.state.nameAvailable ?
                      <FontAwesome name='check-circle' size={18} color='#1aaa55' style={{ marginLeft: 5 }}/> :
                      <FontAwesome name='exclamation-circle' size={18} color='#db3b21' style={{ marginLeft: 5 }}/>)
                    : null
                }
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
              ref={ ref => this.nameTextInput = ref }
              autoCorrect={false}
              returnKeyType={"done"}
              underlineColorAndroid='transparent'
              placeholder='Name for new wallet'
              onChangeText={ (text) => this.onNameChanged.bind(this)(text) }/>
          </View>
          <ModalDropdown
            options={[
              { key: 0, name: 'Hot wallet' },
              { key: 1, name: 'Hot wallet (readonly)' },
              { key: 2, name: 'Cold wallet' }
            ]}
            animated={false}
            showsVerticalScrollIndicator={true}
            onSelect={ this.onSelectTypeDropDown.bind(this) }
            adjustFrame={ this.adjustFrameTypeDropDown.bind(this) }
            renderRow={ this.renderTypeDropDownRow.bind(this) }
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
              }}>Type</Text>
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
                  { this.state.type.name }
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
                }}>Passphrase</Text>
                {
                  this.state.passphrase ?
                      <FontAwesome name='check-circle' size={18} color='#1aaa55' style={{ marginLeft: 5 }}/> : null
                }
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
              ref={ ref => this.passphraseTextInput = ref }
              autoCorrect={false}
              secureTextEntry={true}
              returnKeyType={"done"}
              autoCapitalize='none'
              underlineColorAndroid='transparent'
              placeholder='Seed passphrase'
              onChangeText={ (text) => this.setState({ passphrase: text }) }/>
          </View>
          <Button
            onPress={ this.onCreatePress.bind(this) }
            disabled={ (!this.state.name ||
                        !this.state.nameAvailable ||
                        !this.state.passphrase) }
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
            title='Create Wallet'
            icon={{
              name: 'library-add',
              type: 'material',
              color: '#ffffff',
              size: 22
            }}/>
          <Overlay visible={this.state.generatingVisible}
            animationType="zoomIn"
            animationDuration={200}
            containerStyle={{ backgroundColor: '#000000aa' }}
            childrenWrapperStyle={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 15,
              margin: 0
            }}>
            <Text style={{ fontSize: 18 }}>Generating Wallet</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
              <Progress.Bar color='#ca2b1e' indeterminate={true}/>
              <Text style={{ fontSize: 14, color: '#777777', marginTop: 15 }}>Please wait...</Text>
            </View>
          </Overlay>
          <Overlay visible={this.state.generatedVisible}
            animationType="zoomIn"
            animationDuration={200}
            containerStyle={{ backgroundColor: '#000000aa' }}
            childrenWrapperStyle={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 15,
              margin: 0
            }}>
            <Text style={{ fontSize: 18, marginBottom: 15 }}>Wallet Generated</Text>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <BlockieSvg
                  size={14}
                  scale={1.5}
                  seed={ this.state.account.address }
                  containerStyle={{
                    overflow: 'hidden',
                    marginRight: 5,
                    borderRadius: 3,
                }}/>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{this.state.name}</Text>
              </View>
              <Text style={{ fontSize: 12 }}>{ this.state.account.address }</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#777777', marginBottom: 15 }}>
              It is strongly recommended that you make a hard copy backup of
              your wallet. Be prepared to copy down information before continuing.
            </Text>
            <Button
              onPress={ () => this.setState({ generatedVisible: false, seedBackupVisible: true }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}
              title="Ready"
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'check',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </Overlay>
          <Overlay visible={this.state.seedBackupVisible}
            animationType="zoomIn"
            animationDuration={200}
            containerStyle={{ backgroundColor: '#000000aa' }}
            childrenWrapperStyle={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 15,
              margin: 0
            }}>
            <Text style={{ fontSize: 18, marginBottom: 15 }}>Backup Seed Words</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 }}>{ this.state.account.mnemonics }</Text>
            <Text style={{ fontSize: 14, color: '#777777', marginBottom: 15 }}>
              You can import/restore your wallet using these 12 words and
              the passphrase you chose. If you are smart, you will write them down
              and keep them secret.
            </Text>
            <Button
              onPress={ () => this.setState({ seedBackupVisible: false, privateKeyBackupVisible: true }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}
              title="I'm Smart"
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'check',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </Overlay>
          <Overlay visible={this.state.privateKeyBackupVisible}
            animationType="zoomIn"
            animationDuration={200}
            containerStyle={{ backgroundColor: '#000000aa' }}
            childrenWrapperStyle={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 15,
              margin: 0
            }}>
            <Text style={{ fontSize: 18, marginBottom: 15 }}>Backup Private Key</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 }}>{ this.state.account.privateKey }</Text>
            <Text style={{ fontSize: 14, color: '#777777', marginBottom: 15 }}>
              You can import/restore your wallet using only the private key.
              If you are smart, you will write it down and keep it secret.
            </Text>
            <Button
              onPress={ () => this.setState({ privateKeyBackupVisible: false, successVisible: true }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}
              title="I'm Smart"
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'check',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </Overlay>
          <Overlay visible={this.state.successVisible}
            animationType="zoomIn"
            animationDuration={200}
            containerStyle={{ backgroundColor: '#000000aa' }}
            childrenWrapperStyle={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 15,
              margin: 0
            }}>
            <Text style={{ fontSize: 18 }}>Wallet Created</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
              <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
              <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Wallet created successfully</Text>
              <Button
                onPress={ () => this.props.navigation.navigate('MainRoot') }
                titleStyle={{ fontSize: 16 }}
                buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
                containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
                title='Go to Wallet'
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
              padding: 15,
              margin: 0
            }}>
            <Text style={{ fontSize: 18 }}>Create Wallet Failed</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
              <Ionicons name='ios-close-circle-outline' color='#db3b21' size={75}/>
              <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Wallet generation error</Text>
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
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}
