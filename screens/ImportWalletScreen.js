import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, TextInput, ScrollView, NativeModules, Platform, View, Dimensions } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Button } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ModalDropdown from 'react-native-modal-dropdown';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';
import Util from '../libs/Util.js';

export default class ImportWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Import Wallet',
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

  onSelectPrivateKeyTypeDropDown(index, rowData) {
    this.setState({ privateKeyType: rowData });
  }

  onPrivateKeyNameChanged(text) {
    var nameTaken = false;
    if(text.length > 0)
    { nameTaken = TronWalletService.walletExistsWithName(text); }

    this.setState({ privateKeyName: text, privateKeyNameAvailable: !nameTaken });
  }

  onSelectSeedWordsTypeDropDown(index, rowData) {
    this.setState({ seedWordsType: rowData });
  }

  onSeedWordsNameChanged(text) {
    var nameTaken = false;
    if(text.length > 0)
    { nameTaken = TronWalletService.walletExistsWithName(text); }

    this.setState({ seedWordsName: text, seedWordsNameAvailable: !nameTaken });
  }

  onSeedWordsChanged(text) {
    var wordsValid = false;
    if(text.length > 0)
    {
      var words = text.split(' ');
      wordsValid = (words.length === 12 && words[11] !== '');
    }

    this.setState({ seedWords: text, seedWordsValid: wordsValid });
  }

  async onSeedWordsImportPress() {
    this.setState({ restoringVisible: true, name: this.state.seedWordsName, type: this.state.seedWordsType });
    await Util.sleep(1000);

    var restoredAccount = await TronWalletService.restoreAccountFromMnemonics(this.state.seedWords, this.state.seedWordsPassphrase);
    if(restoredAccount)
    {
      var newWallet = {
        name: this.state.name,
        address: restoredAccount.address,
        privateKey: restoredAccount.privateKey,
        balance: 0.0,
        assets: [],
        type: this.state.type.key,
        timestamp: null
      }

      TronWalletService.addWallet(newWallet);
      TronWalletService.setCurrentWalletByName(newWallet.name);
      await TronWalletService.save();

      this.setState({
        account: restoredAccount,
        restoringVisible: false,
        restoredVisible: true
      });
    }
    else {
      this.setState({
        restoringVisible: false,
        failVisible: true
      });
    }
  }

  async onPrivateKeyImportPress() {
    this.setState({ restoringVisible: true, name: this.state.privateKeyName, type: this.state.privateKeyType });
    await Util.sleep(1000);

    var restoredAccount = await TronWalletService.restoreAccountFromPrivateKey(this.state.privateKey);
    if(restoredAccount)
    {
      var newWallet = {
        name: this.state.name,
        address: restoredAccount.address,
        privateKey: restoredAccount.privateKey,
        balance: 0.0,
        assets: [],
        type: this.state.type.key,
        timestamp: null
      }

      TronWalletService.addWallet(newWallet);
      TronWalletService.setCurrentWalletByName(newWallet.name);
      await TronWalletService.save();

      this.setState({
        account: restoredAccount,
        restoringVisible: false,
        restoredVisible: true
      });
    }
    else {
      this.setState({
        restoringVisible: false,
        failVisible: true
      });
    }
  }

  renderImportSeedWordsView() {
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{
          margin: 15
        }}
        enableOnAndroid={true}>
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
                this.state.seedWordsName ?
                  (this.state.seedWordsNameAvailable ?
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
            ref={ ref => this.seedWordsNameTextInput = ref }
            autoCorrect={false}
            returnKeyType={"done"}
            underlineColorAndroid='transparent'
            placeholder='Name for imported wallet'
            onChangeText={ (text) => this.onSeedWordsNameChanged.bind(this)(text) }/>
        </View>
        <ModalDropdown
          options={[
            { key: 0, name: 'Hot wallet' },
            { key: 1, name: 'Hot wallet (readonly)' },
            { key: 2, name: 'Cold wallet' }
          ]}
          animated={false}
          showsVerticalScrollIndicator={true}
          onSelect={ this.onSelectSeedWordsTypeDropDown.bind(this) }
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
                { this.state.seedWordsType.name }
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
                this.state.seedWordsPassphrase ?
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
            ref={ ref => this.seedWordsPassphraseTextInput = ref }
            autoCorrect={false}
            secureTextEntry={true}
            returnKeyType={"done"}
            autoCapitalize='none'
            underlineColorAndroid='transparent'
            placeholder='Seed passphrase'
            onChangeText={ (text) => this.setState({ seedWordsPassphrase: text }) }/>
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
              }}>Seed Words</Text>
              {
                this.state.seedWords ?
                  (this.state.seedWordsValid ?
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
            ref={ ref => this.seedWordsTextInput = ref }
            autoCorrect={false}
            returnKeyType={"done"}
            autoCapitalize='none'
            underlineColorAndroid='transparent'
            placeholder='12 space seperated seed words'
            onChangeText={ this.onSeedWordsChanged.bind(this) }/>
        </View>
        <Button
          onPress={ this.onSeedWordsImportPress.bind(this) }
          disabled={ (!this.state.seedWordsName ||
                      !this.state.seedWordsNameAvailable ||
                      !this.state.seedWordsPassphrase ||
                      !this.state.seedWords ||
                      !this.state.seedWordsValid) }
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
          title='Import Wallet'
          icon={{
            name: 'import',
            type: 'material-community',
            color: '#ffffff',
            size: 22
          }}/>
      </KeyboardAwareScrollView>
    );
  }

  renderImportPrivateKeyView() {
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{
          margin: 15
        }}
        enableOnAndroid={true}>
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
                this.state.privateKeyName ?
                  (this.state.privateKeyNameAvailable ?
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
            ref={ ref => this.privateKetNameTextInput = ref }
            autoCorrect={false}
            returnKeyType={"done"}
            underlineColorAndroid='transparent'
            placeholder='Name for imported wallet'
            onChangeText={ this.onPrivateKeyNameChanged.bind(this) }/>
        </View>
        <ModalDropdown
          options={[
            { key: 0, name: 'Hot wallet' },
            { key: 1, name: 'Hot wallet (readonly)' },
            { key: 2, name: 'Cold wallet' }
          ]}
          animated={false}
          showsVerticalScrollIndicator={true}
          onSelect={ this.onSelectPrivateKeyTypeDropDown.bind(this) }
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
                { this.state.privateKeyType.name }
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
              }}>Private Key</Text>
              {
                this.state.privateKey ?
                  (this.state.privateKey.length === 64 ?
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
            ref={ ref => this.privateKeyTextInput = ref }
            autoCorrect={false}
            returnKeyType={"done"}
            autoCapitalize='none'
            underlineColorAndroid='transparent'
            placeholder='64 character private key'
            onChangeText={ (text) => this.setState({ privateKey: text }) }/>
        </View>
        <Button
          onPress={ this.onPrivateKeyImportPress.bind(this) }
          disabled={ (!this.state.privateKeyName ||
                      !this.state.privateKeyNameAvailable ||
                      !this.state.privateKey ||
                      this.state.privateKey.length !== 64) }
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
          title='Import Wallet'
          icon={{
            name: 'import',
            type: 'material-community',
            color: '#ffffff',
            size: 22
          }}/>
      </KeyboardAwareScrollView>
    );
  }

  renderTabViewScene = SceneMap({
    seedWords: this.renderImportSeedWordsView.bind(this),
    privateKey: this.renderImportPrivateKeyView.bind(this),
  });

  renderTabViewHeader(props) {
    return (
    <TabBar
      {...props}
      style={{ backgroundColor: '#333333' }}
      indicatorStyle={{ backgroundColor: '#ca2b1e', height: 3 }}
      labelStyle={{ fontSize: 16 }}
      getLabelText={({ route }) => route.title}/>);
  }

  onTabViewChanged(index) {
    this.setState({ index: index });
  }

  constructor()
  {
    super();

    var initState = {
      seedWordsName: null,
      seedWordsNameAvailable: false,
      seedWordsType: { key: 0, name: 'Hot wallet' },
      seedWordsPassphrase: null,
      seedWords: null,
      seedWordsValid: false,
      privateKeyName: null,
      privateKeyAvailable: false,
      privateKeyType: { key: 0, name: 'Hot wallet' },
      privateKey: null,
      name: null,
      type: null,
      account: {
        address: null,
        privateKey: null,
        mnemonics: null
      },
      restoringVisible: false,
      successVisible: false,
      failVisible: false,
      index: 0,
      routes: [
        { key: 'seedWords', title: 'Seed Words' },
        { key: 'privateKey', title: 'Private Key' },
      ],
    };

    this.state = initState;
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <TabViewAnimated
          navigationState={this.state}
          renderScene={this.renderTabViewScene}
          renderHeader={this.renderTabViewHeader.bind(this)}
          onIndexChange={this.onTabViewChanged.bind(this)}/>
        <Overlay visible={this.state.restoringVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 15,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Restoring Wallet</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Progress.Bar color='#ca2b1e' indeterminate={true}/>
            <Text style={{ fontSize: 14, color: '#777777', marginTop: 15 }}>Please wait...</Text>
          </View>
        </Overlay>
        <Overlay visible={this.state.restoredVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 15,
            margin: 0
          }}>
          <Text style={{ fontSize: 18, marginBottom: 15 }}>Wallet Restored</Text>
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
            Remember to keep multiple backups of your wallet and do not share it with anyone.
          </Text>
          <Button
            onPress={ () => this.setState({ restoredVisible: false, successVisible: true }) }
            titleStyle={{ fontSize: 16 }}
            buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
            containerStyle={{ borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}
            title="OK"
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
          <Text style={{ fontSize: 18 }}>Wallet Imported</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Wallet imported successfully</Text>
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
          <Text style={{ fontSize: 18 }}>Import Wallet Failed</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-close-circle-outline' color='#db3b21' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Wallet restoration error</Text>
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
