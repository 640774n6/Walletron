import React from 'react';
import { StatusBar, SafeAreaView, ScrollView, Platform  } from 'react-native';
import { List, ListItem } from 'react-native-elements';

export default class SettingsScreen extends React.Component
{
  static navigationOptions = { title: 'Settings' };
  state = {
    settings:
    [
      { title: 'Turbo Mode', value: true },
      { title: 'Awesome Mode', value: false },
      { title: 'Use Catz', value: true }
    ]
  };

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle='light-content'/>
        <ScrollView style={{ flex: 1}}>
          <List containerStyle={{ marginTop: 30, marginBottom: 30 }}>
          {
            this.state.settings.map((item, i) =>
            (
              <ListItem
                key={i}
                title={item.title}
                hideChevron
                switchButton
                switched={item.value}
                switchOnTintColor='#ca2b1e'
                switchThumbTintColor={Platform.OS === 'android' ? '#ffffff' : null}
                onSwitch={(value) =>
                {
                  const newSettings = [...this.state.settings];
                  newSettings[i].value = value;
                  this.setState({ settings: newSettings });
                }}/>
            ))
          }
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
