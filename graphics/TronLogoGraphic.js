import React from 'react';
import { Constants, Svg } from 'expo';
import { Animated } from 'react-native';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export class TronLogoNameGraphic extends React.Component {
  render() {
    const style = this.props.style;
    const strokeColor = this.props.strokeColor ? this.props.strokeColor : null;
    const strokeWidth = this.props.strokeWidth ? this.props.strokeWidth : 5;
    const fillColor = this.props.fillColor ? this.props.fillColor: 'transparent';

    return (
      <AnimatedSvg style={style} viewBox="0 0 503.863 138.21">
        <Svg.Rect fill={fillColor} x="33.436" y="47.099" width="11.31" height="79.229"/>
        <Svg.Rect fill={fillColor} y="11.271" width="100.786" height="11.307"/>
        <Svg.Rect fill={fillColor} x="56.048" y="47.099" width="11.304" height="79.229"/>
        <Svg.Rect fill={fillColor} x="425.958" y="83.236" width="11.435" height="43.213"/>
        <Svg.Polygon fill={fillColor} points="492.428,11.275 492.428,104.184 403.111,0 403.111,126.449 414.544,126.449 414.544,34.027 503.863,138.21
        	503.863,11.275 "/>
        <Svg.Path fill={fillColor} d="M316.591,11.281c-31.716,0-57.529,25.804-57.529,57.524c0,31.721,25.813,57.523,57.529,57.523
        	c31.726,0,57.533-25.803,57.533-57.523C374.125,37.084,348.317,11.281,316.591,11.281 M316.591,115
        	c-25.466,0-46.19-20.725-46.19-46.195c0-25.476,20.725-46.201,46.19-46.201c25.48,0,46.199,20.725,46.199,46.201
        	C362.791,94.275,342.072,115,316.591,115"/>
        <Svg.Path fill={fillColor} d="M316.58,59.725c-4.297,0-7.781,3.483-7.781,7.781s3.484,7.78,7.781,7.78c4.298,0,7.781-3.482,7.781-7.78
        	S320.877,59.725,316.58,59.725"/>
        <Svg.Path fill={fillColor} d="M205.632,79.9c14.282-4.382,24.699-17.764,24.699-33.552c0-19.337-15.633-35.073-34.851-35.073v0.005l-54.726-0.005h-11.23
        	v115.174h11.23V22.72h54.726c12.864,0,23.33,10.685,23.33,23.629c0,12.938-10.46,23.659-23.314,23.664l-0.016-0.011l-43.326-0.01
        	v56.457h11.233V81.437h30.019h0.058l23.772,45.013h13.095L205.632,79.9z"/>
      </AnimatedSvg>
    );
  }
}

export class TronLogoPathGraphic extends React.Component {
  render() {
    const style = this.props.style;
    const strokeColor = this.props.strokeColor ? this.props.strokeColor : 'transparent';
    const strokeWidth = this.props.strokeWidth ? this.props.strokeWidth : 5;
    const fillColor = this.props.fillColor ? this.props.fillColor: 'transparent';

    return (
      <AnimatedSvg style={style} viewBox='100 100 430 430'>
        <Svg.Path
          d='M505.4 214.7c-17.3-12.1-35.8-25-53.9-37.8-.4-.3-.8-.6-1.3-.9-2-1.5-4.3-3.1-7.1-4l-.2-.1c-48.4-11.7-97.6-23.7-145.2-35.3-43.2-10.5-86.3-21-129.5-31.5-1.1-.3-2.2-.6-3.4-.9-3.9-1.1-8.4-2.3-13.2-1.7-1.4.2-2.6.7-3.7 1.4l-1.2 1c-1.9 1.8-2.9 4.1-3.4 5.4l-.3.8v4.6l.2.7c27.3 76.5 55.3 154.1 82.3 229.2 20.8 57.8 42.4 117.7 63.5 176.5 1.3 4 5 6.6 9.6 7h1c4.3 0 8.1-2.1 10-5.5l79.2-115.5c19.3-28.1 38.6-56.3 57.9-84.4 7.9-11.5 15.8-23.1 23.7-34.6 13-19 26.4-38.6 39.7-57.7l.7-1v-1.2c.3-3.5.4-10.7-5.4-14.5m-92.8 42.1c-18.6 9.7-37.6 19.7-56.7 29.6 11.1-11.9 22.3-23.9 33.4-35.8 13.9-15 28.4-30.5 42.6-45.7l.3-.3c1.2-1.6 2.7-3.1 4.3-4.7 1.1-1.1 2.3-2.2 3.4-3.5 7.4 5.1 14.9 10.3 22.1 15.4 5.2 3.7 10.5 7.4 15.9 11.1-22 11.2-44 22.7-65.3 33.9m-47.8-4.8c-14.3 15.5-29.1 31.4-43.8 47.1-28.5-34.6-57.6-69.7-85.8-103.6-12.8-15.4-25.7-30.9-38.5-46.3l-.1-.1c-2.9-3.3-5.7-6.9-8.5-10.3-1.8-2.3-3.7-4.5-5.6-6.8 11.6 3 23.3 5.8 34.8 8.5 10.1 2.4 20.6 4.9 30.9 7.5 58 14.1 116.1 28.2 174.1 42.3-19.3 20.6-38.7 41.5-57.5 61.7m-50.3 194.9c1.1-10.5 2.3-21.3 3.3-31.9.9-8.5 1.8-17.2 2.7-25.5 1.4-13.3 2.9-27.1 4.1-40.6l.3-2.4c1-8.6 2-17.5 2.6-26.4 1.1-.6 2.3-1.2 3.6-1.7 1.5-.7 3-1.3 4.5-2.2 23.1-12.1 46.2-24.2 69.4-36.2 23.1-12 46.8-24.4 70.3-36.7-21.4 31-42.9 62.3-63.7 92.8-17.9 26.1-36.3 53-54.6 79.5-7.2 10.6-14.7 21.4-21.8 31.8-8 11.6-16.2 23.5-24.2 35.4 1-12 2.2-24.1 3.5-35.9M175.1 155.6c-1.3-3.6-2.7-7.3-3.9-10.8 27 32.6 54.2 65.4 80.7 97.2 13.7 16.5 27.4 32.9 41.1 49.5 2.7 3.1 5.4 6.4 8 9.6 3.4 4.1 6.8 8.4 10.5 12.5-1.2 10.3-2.2 20.7-3.3 30.7-.7 7-1.4 14-2.2 21.1v.1c-.3 4.5-.9 9-1.4 13.4-.7 6.1-2.3 19.9-2.3 19.9l-.1.7c-1.8 20.2-4 40.6-6.1 60.4-.9 8.2-1.7 16.6-2.6 25-.5-1.5-1.1-3-1.6-4.4-1.5-4-3-8.2-4.4-12.3l-10.7-29.7C242.9 344.2 209 250 175.1 155.6'
          stroke={strokeColor}
          fill={fillColor}
          strokeWidth={strokeWidth}/>
      </AnimatedSvg>
    );
  }
}

export class TronLogoLineGraphic extends React.Component {
  render() {
    const style = this.props.style;
    const strokeColor = this.props.strokeColor ? this.props.strokeColor : null;
    const strokeWidth = this.props.strokeWidth ? this.props.strokeWidth : 5;

    return (
      <AnimatedSvg style={style} viewBox="0 0 232.6 267.5">
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="3.7" y1="4.7" x2="115.3" y2="134"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="114.6" y1="134" x2="100.2" y2="267.5"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="3.5" y1="3.5" x2="192" y2="48.7"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="192" y1="49.5" x2="114.6" y2="134"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="232.6" y1="76.8" x2="101" y2="267.5"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="115.3" y1="134" x2="231.9" y2="76.8"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="192" y1="48.7" x2="232.6" y2="76.8"/>
        <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="2.8" y1="4.5" x2="100.2" y2="268.5"/>
      </AnimatedSvg>
    );
  }
}
