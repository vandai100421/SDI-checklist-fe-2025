import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';

export interface IProps {
  style?: StyleProp<ViewStyle>;
  onChange: (local: 'vi' | 'en' | string) => void;
}

export type SelectLocal = React.FC<IProps>;
