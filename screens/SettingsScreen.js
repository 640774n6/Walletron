import React from 'react';
import { StatusBar, SafeAreaView, ScrollView  } from 'react-native';
import { List, ListItem } from 'react-native-elements';

const listData = [
  { title: 'Setting', value: true },
  { title: 'Setting', value: false },
  { title: 'Setting', value: true }
];

export default class SettingsScreen extends React.Component
{
  static navigationOptions = { title: 'Settings' };
  render()
  {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle='light-content'/>
        <ScrollView style={{ flex: 1}}>
          <List containerStyle={{ marginTop: 30, marginBottom: 30 }}>
          {
            listData.map((item, i) =>
            (
              <ListItem
                key={i}
                title={item.title}
                hideChevron
                switchButton
                switched={item.value}
                switchOnTintColor='#ca2b1e'
                />
            ))
          }
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
