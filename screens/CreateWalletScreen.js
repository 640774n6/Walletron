import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, ScrollView, NativeModules } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default class CreateWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Create Wallet',
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <Text style={{ color: '#ffffff', marginLeft: 15 }}>Cancel</Text>
        </TouchableOpacity>
      )
    };
  };

  async componentDidMount()
  {
    var tronClient = NativeModules.TronClient;
    var account = await tronClient.generateAccount('Boost4g63T!');
    console.log('GENERATED ACCOUNT:');
    console.log(account.address);
    console.log(account.privateKey);
    console.log(account.mnemonics);

    var restoredAccount = await tronClient.restoreAccount(account.mnemonics, 'Boost4g63T!');
    console.log('RESTORED ACCOUNT:');
    console.log(restoredAccount.address);
    console.log(restoredAccount.privateKey);
    console.log(restoredAccount.mnemonics);
  }

  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
        <ScrollView>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
