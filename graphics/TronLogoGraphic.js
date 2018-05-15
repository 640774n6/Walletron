import React from 'react';
import { Constants, Svg } from 'expo';

export default class TronLogoGraphic extends React.Component {
    render() {
        let style = this.props.style;
        let strokeColor = this.props.strokeColor ? this.props.strokeColor : '#000000';
        let strokeWidth = this.props.strokeWidth ? this.props.strokeWidth : 5;
        return (
            <Svg style={style} preserveAspectRatio="true" viewBox="0 0 232.6 267.5">
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="3.7" y1="4.7" x2="115.3" y2="134"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="114.6" y1="134" x2="100.2" y2="267.5"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="3.5" y1="3.5" x2="192" y2="48.7"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="192" y1="49.5" x2="114.6" y2="134"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="232.6" y1="76.8" x2="101" y2="267.5"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="115.3" y1="134" x2="231.9" y2="76.8"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth * 1.4} x1="192" y1="48.7" x2="232.6" y2="76.8"/>
              <Svg.Line stroke={strokeColor} strokeWidth={strokeWidth} x1="2.8" y1="4.5" x2="100.2" y2="268.5"/>
            </Svg>
        );
    }
}
