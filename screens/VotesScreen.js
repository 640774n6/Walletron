import React from 'react';
import { StatusBar, SafeAreaView, Platform, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { LinearGradient } from 'expo';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { Button, SearchBar } from 'react-native-elements';
import Overlay from 'react-native-modal-overlay';
import * as Progress from 'react-native-progress';
import TextInputMask from 'react-native-text-input-mask';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'

import TronWalletService from '../libs/TronWalletService.js';
import BlockieSvg from '../libs/BlockieSvg.js';

export default class VotesScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Votes',
      headerLeft: (Platform.OS === 'android' && <View/>),
      headerRight: (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <TouchableOpacity>
            <MaterialCommunityIcons name='undo-variant' color='#ffffff' size={22} style={{ marginRight: 15 }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={ navigation.state.params ? navigation.state.params.onSubmitVotes : null }>
            <Entypo name='upload' color='#ffffff' size={22}/>
          </TouchableOpacity>
        </View>
      )
    }
  };

  renderListHeader() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name='person' type='material' size={24} color='#000000'/>
          <Text style={{ fontSize: 18, color: '#000000', marginLeft: 5 }}>Representatives</Text>
        </View>
      </View>
    );
  }

  renderListEmpty() {
    return (
      <View style={{
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
      }}>
        <Text style={{ fontSize: 16, color: '#000000', marginBottom: 5 }}>No representatives</Text>
        <Text style={{ fontSize: 14, color: '#777777' }}>Why not become a representative?</Text>
      </View>
    );
  }

  renderListItem({item, index}) {
    return (
      <ListItem
        key={ index }
        title={
          <View>
            <Text ellipsizeMode='tail' numberOfLines={1} style={{ fontSize: 14, color: '#000000' }}>{ item.url }</Text>
            <Text ellipsizeMode='middle' numberOfLines={1} style={{ fontSize: 12, color: '#777777' }}>{ item.address }</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <MaterialIcons name='person-pin' color='#0097ec' size={20}/>
              <Text style={{ fontSize: 12, color: '#0079bf' }}>{ item.totalVoteCount.toString() + ' votes' }</Text>
            </View>
          </View>
        }
        hideChevron
        rightTitle={
          <TextInputMask
            textAlign='right'
            style={{
              flex: 1,
              color: '#000000',
              fontSize: 16,
              height: 22
            }}
            autoCorrect={false}
            returnKeyType={"done"}
            autoCapitalize='none'
            underlineColorAndroid='transparent'
            keyboardType='numeric'
            placeholder={ `Vote` }
            mask='[09999999999]'
            value={ item.voteCount }
            onChangeText={ (formatted, extracted) => this.onVoteCountChanged.bind(this)(item, formatted) }/>
        }
        rightContentContainerStyle={{
          alignItems: 'stretch'
        }}
        containerStyle={{
          borderTopLeftRadius: index === 0 ? 8 : null,
          borderTopRightRadius: index === 0 ? 8 : null,
          borderBottomLeftRadius: index === this.state.editWitnesses.length - 1 ? 8 : null,
          borderBottomRightRadius: index === this.state.editWitnesses.length - 1 ? 8 : null,
          backgroundColor: '#ffffff',
          borderBottomColor: index != this.state.editWitnesses.length - 1 ? '#dfdfdf' : null,
          borderBottomWidth: index != this.state.editWitnesses.length - 1 ? 1 : null,
          marginBottom: index === this.state.editWitnesses.length - 1 ? 10 : null,
          marginLeft: 10,
          marginRight: 10
        }}/>
    );
  }

  async pullWitnesses() {
    var witnessesList = await TronWalletService.getWitnesses();
    if(witnessesList)
    {
      var witnesses = witnessesList
        .map(witness => {
        return {
          address: witness.address,
          url: witness.url,
          voteCount: TronWalletService.getVoteCountForAddress(witness.address),
          totalVoteCount: parseInt(witness.voteCount),
          totalProduced: parseInt(witness.totalProduced),
          totalMissed: parseInt(witness.totalMissed),
          latestBlockNum: parseInt(witness.latestBlockNum),
          latestSlotNum: parseInt(witness.latestSlotNum)
        };
      })
      .sort((a, b) => a.totalVoteCount < b.totalVoteCount ? 1 : -1);
      this.setState({ witnesses: witnesses, editWitnesses: witnesses });
    }
  }

  refresh() {
    this.pullWitnesses();
  }

  updateEditVotesTotalFromEditWitnesses() {
    var newTotal = 0;
    this.state.editWitnesses.forEach(witness => { newTotal += witness.voteCount; });
    this.setState({ editVotesTotal: newTotal });
  }

  getVotesFromEditWitnesses() {
    return this.state.editWitnesses
      .filter(witness => witness.voteCount > 0)
      .map(witness => { return { address: witness.address, count: witness.voteCount } });
  }

  onVoteCountChanged(witness, text) {
    var newCount = parseInt(text);
    newCount = newCount ? newCount : 0;
    witness.voteCount = newCount;

    this.updateEditVotesTotalFromEditWitnesses();
  }

  async onSubmitVotes() {
      this.setState({ confirmVisible: true });
  }

  async onConfirmPress() {
    this.setState({ confirmVisible: false, votingVisible: true });

    var votes = this.getVotesFromEditWitnesses();
    var result = await TronWalletService.voteFromCurrentWallet(votes);
    if(result) { this.setState({ votingVisible: false, successVisible: true }); }
    else { this.setState({ votingVisible: false, failVisible: true }); }
  }

  onBackToVotesPress() {
    this.setState({ successVisible: false });
    this.props.navigation.pop();
  }

  constructor()
  {
    super();

    var initState = {
      walletName: null,
      walletAddress: null,
      frozenTotal: 0,
      votes: [],
      votesTotal: 0,
      editVotesTotal: 0,
      witnesses: [],
      editWitnesses: [],
      confirmVisible: false,
      votingVisible: false,
      successVisible: false,
      failVisible: false
    };

    var currentWallet = TronWalletService.getCurrentWallet();
    if(currentWallet)
    {
      initState.walletName = currentWallet.name;
      initState.walletAddress = currentWallet.address;
      initState.frozenTotal = parseInt(currentWallet.frozenTotal);
      initState.votes = currentWallet.votes;
      initState.votesTotal = parseInt(currentWallet.votesTotal);
      initState.editVotesTotal = parseInt(currentWallet.votesTotal);
    }

    this.state = initState;
  }

  componentDidMount() {
    this.props.navigation.setParams({ onSubmitVotes: this.onSubmitVotes.bind(this) });
    this.refresh();
  }

  render()
  {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#dfdfdf' }}>
        <StatusBar barStyle='light-content'/>
        <View style={{ backgroundColor: '#ffffff' }}>
          <LinearGradient
            colors={ ['#333333', '#1b1b1b'] }
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 50
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name='person-pin' color='#0097ec' size={26}/>
                <Text style={{ fontSize: 18, color: '#ffffff', marginLeft: 5, marginRight: 2 }}>
                  { `${this.state.frozenTotal - this.state.editVotesTotal} / ${ this.state.frozenTotal }` }
                </Text>
              </View>
            </LinearGradient>
            <SearchBar
              placeholder='Search'
              placeholderTextColor='#777777'
              containerStyle={{ backgroundColor: '#1b1b1b', borderTopWidth: 0, borderBottomWidth: 0 }}
              inputContainerStyle={{ backgroundColor: '#ffffff' }}
              inputStyle={{ fontSize: 16, color: '#000000' }}/>
        </View>
        <KeyboardAwareFlatList
          enableOnAndroid={true}
          ref={ ref => this.scrollView = ref }
          style={{ flex: 1 }}
          keyExtractor={ (item, index) => index.toString() }
          ListHeaderComponent={ this.renderListHeader.bind(this) }
          ListEmptyComponent={ this.renderListEmpty.bind(this) }
          data={ this.state.editWitnesses }
          renderItem={ this.renderListItem.bind(this) }/>
        <Overlay visible={this.state.confirmVisible}
          closeOnTouchOutside animationType="zoomIn"
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}
          animationDuration={200}
          onClose={ () => this.setState({ confirmVisible: false })}>
          <Text style={{ fontSize: 18, marginBottom: 30 }}>Vote Confirmation</Text>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <BlockieSvg
                size={14}
                scale={1.5}
                seed={ this.state.walletAddress }
                containerStyle={{
                  overflow: 'hidden',
                  marginRight: 5,
                  borderRadius: 3,
              }}/>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{this.state.walletName}</Text>
            </View>
            <Text style={{ fontSize: 12 }}>{ this.state.walletAddress }</Text>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name='person-pin' color='#000000' size={24}/>
            <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>{ `${this.state.editVotesTotal} Votes` }</Text>
          </View>
          <Ionicons name='ios-arrow-round-down-outline' color='#000000' size={30}/>
          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <MaterialIcons name='person' color='#000000' size={22}/>
              <Text style={{ fontSize: 16, color: '#000000', marginLeft: 5 }}>Representatives</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Button
              onPress={ () => this.setState({ confirmVisible: false }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden', marginRight: 10 }}
              title='Cancel'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'times',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
            <Button
              onPress={ this.onConfirmPress.bind(this) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#1aaa55', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Confirm'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'check',
                type: 'font-awesome',
                color: '#ffffff',
                size: 18
              }}/>
          </View>
        </Overlay>
        <Overlay visible={this.state.votingVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Voting</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Progress.Bar color='#ca2b1e' indeterminate={true}/>
            <Text style={{ fontSize: 14, color: '#777777', marginTop: 15 }}>Please wait...</Text>
          </View>
        </Overlay>
        <Overlay visible={this.state.successVisible}
          animationType="zoomIn"
          animationDuration={200}
          containerStyle={{ backgroundColor: '#000000aa' }}
          childrenWrapperStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Vote Complete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-checkmark-circle-outline' color='#1aaa55' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction successful</Text>
            <Button
              onPress={ () => this.setState({ successVisible: false }) }
              titleStyle={{ fontSize: 16 }}
              buttonStyle={{ backgroundColor: '#777777', paddingLeft: 5, paddingRight: 5 }}
              containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
              title='Back to Votes'
              iconContainerStyle={{ marginRight: 0 }}
              icon={{
                name: 'legal',
                type: 'font-awesome',
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
            padding: 10,
            margin: 0
          }}>
          <Text style={{ fontSize: 18 }}>Vote Incomplete</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
            <Ionicons name='ios-close-circle-outline' color='#db3b21' size={75}/>
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 15 }}>Transaction failed</Text>
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
