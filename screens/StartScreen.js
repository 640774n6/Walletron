import React from 'react';
import { StatusBar, SafeAreaView, View, ScrollView, Text, TouchableOpacity, Animated } from 'react-native';
import { withNavigation } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo';

import { TronLogoLineGraphic } from '../graphics/TronLogoGraphic.js';

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

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#333333' }}>
        <StatusBar barStyle='light-content'/>
        <LinearGradient
          colors={ ['#333333', '#1b1b1b'] }
          style={{ flex: 1 }}>
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
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
            <ScrollView
              contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
              scrollEventThrottle={ 16 }
              onScroll={ Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollYAnimatedValue }}}], { userNativeDriver: true }) }>
              <View style={{ marginLeft: 50, marginRight: 50 }}>
                <Text style={{ fontSize: 18, color: '#ffffff', alignSelf: 'center', marginBottom: 15 }}>WalleTRON</Text>
                <TouchableOpacity onPress={ this.onCreateWalletPressed.bind(this) }>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ca2b1e',
                    marginBottom: 15,
                    padding: 10,
                    borderRadius: 8
                  }}>
                    <MaterialIcons
                      name='library-add'
                      color='#ffffff'
                      backgroundColor='#ca2b1e'
                      size={22}/>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 16,
                      marginLeft: 5
                    }}>Create Wallet</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={ this.onImportWalletPressed.bind(this) }>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#444444',
                    marginBottom: 15,
                    padding: 10,
                    borderRadius: 8
                  }}>
                    <MaterialCommunityIcons
                      name='import'
                      color='#ffffff'
                      backgroundColor='#ca2b1e'
                      size={22}/>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 16,
                      marginLeft: 5
                    }}>Import Wallet</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
      </SafeAreaView>
    );
  }
}
