import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default class ImportWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Import Wallet',
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <Text style={{ color: '#ffffff', marginLeft: 15 }}>Cancel</Text>
        </TouchableOpacity>
      )
    };
  };

  render()
  {
    return (
      <SafeAreaView>
        <StatusBar barStyle='light-content'/>
      </SafeAreaView>
    );
  }
}
