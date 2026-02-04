import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SwapIconProps {
  size?: number;
  color?: string;
}

export default function SwapIcon({ size = 24, color = '#000000' }: SwapIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M8 3.5L8 16.5M8 3.5L3.5 7.83333M8 3.5L12.5 7.83333" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M17 20.5L17 7.5M17 20.5L21.5 16.1667M17 20.5L12.5 16.1667" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}
