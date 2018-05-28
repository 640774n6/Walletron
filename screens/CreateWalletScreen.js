import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, ScrollView, NativeModules } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default class CreateWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Create Wallet',
      headerRight: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginRight: 15 }}/>
        </TouchableOpacity>
      )
    };
  };

  async reloadData()
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
    const ownerPrivateKey = '7BE5272664163BFDE05D0148769EFDA7279C6CD4B997288DAA99965639D09481';
    var sendResult = await tronClient.send(ownerPrivateKey, restoredAccount.address, 1);
    console.log("SEND SUCCESS: " + sendResult);

    var sendAssetResult = await tronClient.sendAsset(ownerPrivateKey, restoredAccount.address, 'Eureka', 1);
    console.log("SEND ASSET SUCCESS: " + sendAssetResult);

    var account = await tronClient.getAccount(restoredAccount.address);
    console.log('GET ACCOUNT:');
    console.log('balance: ' + account.balance);
    account.assets.forEach((asset) =>
    { console.log(asset.name + ': ' + asset.balance); });
  }

  componentDidMount()
  {
    this.reloadData();
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
