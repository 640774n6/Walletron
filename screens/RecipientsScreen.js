import React from 'react';
import { StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements'
import { FontAwesome } from '@expo/vector-icons';

const headerRight = (
  <FontAwesome name='user-plus' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
);

export default class RecipientsScreen extends React.Component
{
  static navigationOptions =
  {
    title: 'Recipients',
    headerRight: headerRight
  };
  render()
  {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle='light-content'/>
        <SearchBar
          icon={{ color: '#aaaaaa' }}
          clearIcon={{ color: '#aaaaaa'}}
          placeholder='Search'
          placeholderTextColor='#aaaaaa'
          selectionColor='#ca2b1e'
          containerStyle={{ backgroundColor: '#333333', borderTopWidth: 0, borderBottomWidth: 0 }}
          inputStyle={{ backgroundColor: '#111111', color: '#ffffff' }}/>
          <ScrollView style={{ flex: 1 }}>
          </ScrollView>
      </SafeAreaView>
    );
  }
}
