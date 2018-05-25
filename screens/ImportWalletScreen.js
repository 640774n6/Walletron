import React from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity, Text, ScrollView } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default class ImportWalletScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Import Wallet',
      headerLeft: (
        <TouchableOpacity onPress={ () => navigation.navigate({ routeName: 'Main', params: { transition: 'fade'} }) }>
          <FontAwesome name='bars' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity onPress={ () => navigation.dispatch(NavigationActions.back()) }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginRight: 15 }}/>
        </TouchableOpacity>
      )
    };
  };

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
