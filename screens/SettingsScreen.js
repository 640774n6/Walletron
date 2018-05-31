import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, TextInput, ScrollView, NativeModules, Platform, View, Dimensions } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Button } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TronWalletService from '../libs/TronWalletService.js';

export default class SettingsScreen extends React.Component
{
  static navigationOptions = {
    title: 'Settings',
    headerLeft: (Platform.OS === 'android' && <View/>),
    headerRight: (Platform.OS === 'android' && <View/>)
  };

  onNodeChanged(text) {
    this.setState({ node: text });
  }

  onNodeSubmitEditing() {
    TronWalletService.setFullNodeHost(this.state.node);
  }

  constructor()
  {
    super();

    var initState = {
      node: null
    };

    initState.node = TronWalletService.getFullNodeHost();
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
                }}>Node</Text>
                {
                  this.state.node ?
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
              ref={ ref => this.nodeTextInput = ref }
              autoCorrect={false}
              returnKeyType={"done"}
              underlineColorAndroid='transparent'
              placeholder='hostname:port'
              onChangeText={ this.onNodeChanged.bind(this) }
              onSubmitEditing={ this.onNodeSubmitEditing.bind(this) }
              value={ this.state.node }/>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}
