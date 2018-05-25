import React from 'react';
import { StatusBar, SafeAreaView, ScrollView, Platform, SectionList, View, Text } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';

const DEFAULT_SETTINGS = [
  {
    key: 0,
    title: 'Security',
    icon: {
      name: 'security',
      type: 'material-community',
      color: '#000000'
    },
    data: [
      { title: 'Turbo Mode', icon: { name: 'lock', type: 'entypo', color: '#000000' }, type: 'switch', value: true },
      { title: 'Awesome Mode', icon: { name: 'clock', type: 'entypo', color: '#000000' }, type: 'switch', value: false },
      { title: 'Use Catz', icon: { name: 'cat', type: 'material-community', color: '#000000' }, type: 'switch', value: true }
    ]
  }
];

export default class SettingsScreen extends React.Component
{
  static navigationOptions = { title: 'Settings' };

  constructor()
  {
    super();
    this.state = {
      settings: DEFAULT_SETTINGS
    }
  }

  renderSettingHeaderItem = ({ section, key}) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
        <Icon name={section.icon.name} type={section.icon.type} size={22} color={ section.icon.color }/>
        <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>{section.title}</Text>
      </View>
    );
  }

  renderSettingListItem = ({ item, index, section }) => {
    return (
      <ListItem
        key={index}
        title={item.title}
        titleStyle={{ color: '#000000', fontSize: 16 }}
        leftIcon={item.icon}
        hideChevron
        switch={{
          value: item.value,
          onValueChange: (value) => {
            var newSettings = [...this.state.settings];
            newSettings[section.key].data[index].value = value;
            console.log('section.key = ' + section.key + ', index = ' + index);
            this.setState({ settings: newSettings });
          },
          onTintColor: '#ca2b1e',
          thumbTintColor: Platform.OS === 'android' ? '#ffffff' : null
        }}
        containerStyle={{
          borderTopLeftRadius: index === 0 ? 8 : null,
          borderTopRightRadius: index === 0 ? 8 : null,
          borderBottomLeftRadius: index === section.data.length - 1 ? 8 : null,
          borderBottomRightRadius: index === section.data.length - 1 ? 8 : null,
          backgroundColor: '#ffffff',
          borderBottomColor: index != section.data.length - 1 ? '#dfdfdf' : null,
          borderBottomWidth: index != section.data.length - 1 ? 1 : null,
          marginLeft: 10,
          marginRight: 10
        }}/>
    );
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <ScrollView style={{ flex: 1}}>
          <SectionList
            renderSectionHeader={ this.renderSettingHeaderItem }
            renderItem={ this.renderSettingListItem }
            sections={ this.state.settings }
            keyExtractor={(item, index) => item + index}/>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
