import React from 'react';
import { StyleSheet, StatusBar, SafeAreaView, TouchableOpacity, Text, ScrollView, View, Dimensions } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, Entypo, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BarCodeScanner, Permissions } from 'expo';

export default class ScanBarcodeScreen extends React.Component
{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Scan Barcode',
      headerLeft: (
        <TouchableOpacity onPress={ navigation.state.params ? navigation.state.params.onClosePress : null }>
          <FontAwesome name='close' size={22} color='#ffffff' style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity onPress={ navigation.state.params ? navigation.state.params.onFlipCameraPress : null }>
          <Ionicons name='md-reverse-camera' size={22} color='#ffffff' style={{ marginRight: 15 }}/>
        </TouchableOpacity>
      )
    };
  };

  onClosePress() {
    this.setState({ scanning: false });

    if(this.props.navigation.state.params.onBarcodeScanCancel)
    { this.props.navigation.state.params.onBarcodeScanCancel(); }

    this.props.navigation.dispatch(NavigationActions.back());
  }

  onFlipCameraPress() {
    var newFrontOrBack = this.state.frontOrBack === 'front' ? 'back' : 'front';
    this.setState({ frontOrBack: newFrontOrBack });
  }

  onBarcodeScanned({ type, data }) {
    if(this.state.scanning)
    {
      this.setState({ scanning: false });

      if(this.props.navigation.state.params.onBarcodeScanned)
      { this.props.navigation.state.params.onBarcodeScanned(data); }
      
      this.props.navigation.dispatch(NavigationActions.back());
    }
  }

  constructor()
  {
    super();
    this.state = {
      cameraPermission: false,
      frontOrBack: 'back',
      scanning: true
    }
  }

  async componentDidMount()
  {
    this.props.navigation.setParams({ onClosePress: this.onClosePress.bind(this) });
    this.props.navigation.setParams({ onFlipCameraPress: this.onFlipCameraPress.bind(this)  })

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ cameraPermission: (status === 'granted') });
  }

  render()
  {
    return (
      <SafeAreaView style={{ backgroundColor: '#000000', flex: 1 }}>
        <StatusBar barStyle='light-content'/>
        {!this.state.cameraPermission ?
            <ScrollView
              contentContainerStyle={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Text style={{ color: '#ffffff', margin: 15 }}>Please allow camera permissions in settings to enable this feature.</Text>
            </ScrollView> :
            <View style={{ flex: 1 }}>
              <BarCodeScanner
                style={StyleSheet.absoluteFill}
                type={ this.state.frontOrBack }
                barCodeTypes={ [BarCodeScanner.Constants.BarCodeType.qr] }
                onBarCodeRead={ this.onBarcodeScanned.bind(this) }/>
                <View style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons
                    name='ios-qr-scanner'
                    size={Dimensions.get('window').width * 0.8}
                    color={ this.state.scanning ? '#ffffff66' : '#00ff0066' }/>
                </View>
            </View>
        }
      </SafeAreaView>
    );
  }
}
