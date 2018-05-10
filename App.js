import React from 'react';
import { Font, AppLoading } from 'expo';

import MainNavigator from './navigators/MainNavigator.js'

export default class App extends React.Component
{
  state = { loaded: false };

  async componentDidMount()
  {
    //Load icon fonts then toggle loaded to true
    await Font.loadAsync({ FontAwesome: require('./assets/fontawesome.ttf') });
    this.setState({ loaded: true });
  }

  render()
  {
    //If things are still loading...
    if (!this.state.loaded)
    { return (<AppLoading />); }

    //Return main screen
    return (<MainNavigator />);
  }
}
