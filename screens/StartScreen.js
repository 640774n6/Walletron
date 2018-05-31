import React from 'react';
import { StatusBar, SafeAreaView, View, ScrollView, Text, TouchableOpacity, Animated } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-elements';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo';

import { TronLogoLineGraphic, TronLogoNameGraphic } from '../graphics/TronLogoGraphic.js';

export default class StartScreen extends React.Component
{
  constructor()
  {
    super();
    this.scrollYAnimatedValue = new Animated.Value(0);
  }

  onCreateWalletPressed = () => {
    this.props.navigation.navigate({ routeName: 'CreateWallet', params: { transition: 'modal'} });
  }

  onImportWalletPressed = () => {
    this.props.navigation.navigate({ routeName: 'ImportWallet', params: { transition: 'modal'} });
  }

  render()
  {
    const logoScale = this.scrollYAnimatedValue.interpolate({
      inputRange: [ -150, 150 ],
      outputRange: [ 2.0, 0.0 ],
      extrapolate: 'clamp'
    });

    const logoNameScale = this.scrollYAnimatedValue.interpolate({
      inputRange: [ -150, 0 ],
      outputRange: [ 2.0, 1.0],
      extrapolate: 'clamp'
    });

    const logoNameOpacity = this.scrollYAnimatedValue.interpolate({
      inputRange: [ -150, 0 ],
      outputRange: [ 2.0, 1.0],
      extrapolate: 'clamp'
    });

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#333333' }}>
        <StatusBar barStyle='light-content'/>
        <LinearGradient
          colors={ ['#333333', '#1b1b1b'] }
          style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
              scrollEventThrottle={ 16 }
              onScroll={ Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollYAnimatedValue }}}], { userNativeDriver: true }) }>
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <Animated.View style={{ marginBottom: 15 }}>
                  <TronLogoLineGraphic
                    style={{
                      width: 110,
                      height: 110,
                      transform: [{ scale: logoScale }],
                      opacity: logoScale
                    }}
                    strokeColor='#ca2b1e'
                    strokeWidth='3'/>
                </Animated.View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 27, color: '#ffffff' }}>walle</Text>
                <TronLogoNameGraphic
                  style={{
                    width: 104,
                    height: 28,
                    transform: [{ scale: logoNameScale }],
                    marginBottom: 5
                  }}
                  fillColor='#ffffff'/>
                </View>
                <Text style={{ fontSize: 16, color: '#777777' }}>DECENTRALIZE THE WEB</Text>
              </View>
              <View style={{ marginLeft: 50, marginRight: 50 }}>
                <Button
                  onPress={ this.onCreateWalletPressed.bind(this) }
                  buttonStyle={{
                    backgroundColor: '#ca2b1e',
                    padding: 5
                  }}
                  containerStyle={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginTop: 15
                  }}
                  title='Create Wallet'
                  icon={{
                    name: 'library-add',
                    type: 'material',
                    color: '#ffffff',
                    size: 24
                  }}/>
                <Button
                  onPress={ this.onImportWalletPressed.bind(this) }
                  buttonStyle={{
                    backgroundColor: '#444444',
                    padding: 5
                  }}
                  containerStyle={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginTop: 15
                  }}
                  title='Import Wallet'
                  icon={{
                    name: 'import',
                    type: 'material-community',
                    color: '#ffffff',
                    size: 24
                  }}/>
              </View>
            </ScrollView>
          </LinearGradient>
      </SafeAreaView>
    );
  }
}
