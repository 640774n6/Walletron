import React from 'react';

import StartNavigator from './navigators/StartNavigator.js'
import MainNavigator from './navigators/MainNavigator.js'

export default class App extends React.Component
{
  render()
  {
    return (<StartNavigator/>);
  }
}
