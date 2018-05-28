import React from 'react';
import { createStackNavigator } from 'react-navigation';
import TransitionConfigs from "react-navigation/src/views/StackView/StackViewTransitionConfigs";
import { Platform, View } from 'react-native';

const crossFadeTransition = (sceneProps) => {
  const {position, scene} = sceneProps;
  const {index} = scene;
  const translateX = 0;
  const translateY = 0;

  const opacity = position.interpolate({
      inputRange: [index-1, index, index+1],
      outputRange: [ 0, 1, 0],
  });

  return {
    opacity: opacity,
    transform: [{translateX}, {translateY}]
  };
};

export default class NavigationHelper
{
  static transitionConfigurator = (transitionProps, prevTransitionProps, isModal) => {
    return {
      screenInterpolator: (sceneProps) => {
        const {position, scene} = sceneProps;
        const {index, route} = scene;
        const params = route.params || {};
        const transition = params.transition;
        const defaultConfig = TransitionConfigs.defaultTransitionConfig(transitionProps, prevTransitionProps, isModal);

        switch(transition)
        {
          case 'fade':
            return crossFadeTransition(sceneProps);
            break;
          default:
            return defaultConfig.screenInterpolator(sceneProps);
            break;
        }
      }
    }
  };

  static createSingleScreenNavigator(routeConfig)
  {
    return createStackNavigator(routeConfig,
    {
      navigationOptions:
      {
        headerTitleStyle: { flex: 1, textAlign: 'center' },
        headerStyle: {
          backgroundColor: '#333333',
          borderBottomWidth: 0,
          shadowOpacity: 0,
          elevation: 0
        },
        headerLeft: (Platform.OS === 'android' && <View/>),
        headerRight: (Platform.OS === 'android' && <View/>),
        headerTintColor: '#ffffff'
      }
    });
  }
}
