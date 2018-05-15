import React from 'react';
import { Constants } from 'expo';
import { Animated } from 'react-native';
import { Svg, Line } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default class TronLogoGraphic extends React.Component {
    render() {
        const style = this.props.style;
        const strokeColor = this.props.strokeColor ? this.props.strokeColor : '#000000';
        const strokeWidth = this.props.strokeWidth ? this.props.strokeWidth : 5;

        return (
            <AnimatedSvg style={style} viewBox="0 0 232.6 267.5">
              <Line stroke={strokeColor} strokeWidth={strokeWidth} x1="3.7" y1="4.7" x2="115.3" y2="134"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth} x1="114.6" y1="134" x2="100.2" y2="267.5"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="3.5" y1="3.5" x2="192" y2="48.7"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth} x1="192" y1="49.5" x2="114.6" y2="134"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="232.6" y1="76.8" x2="101" y2="267.5"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth} x1="115.3" y1="134" x2="231.9" y2="76.8"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="192" y1="48.7" x2="232.6" y2="76.8"/>
              <Line stroke={strokeColor} strokeWidth={strokeWidth} x1="2.8" y1="4.5" x2="100.2" y2="268.5"/>
            </AnimatedSvg>
        );
    }
}
