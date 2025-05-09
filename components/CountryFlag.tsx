import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import CountryFlag from "react-native-country-flag";

interface CountryFlagProps {
  /**
   * ISO 3166-1 alpha-2 country code
   * @example "US", "GB", "FR"
   */
  isoCode: string;

  /**
   * Size of the flag (both width and height)
   * @default 24
   */
  size?: number;

  /**
   * Additional style for the flag container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Border radius of the flag
   * @default 0
   */
  borderRadius?: number;
}

/**
 * A component to display a country flag using the ISO country code
 */
export function Flag({ isoCode, size = 24, style }: CountryFlagProps) {
  return <CountryFlag isoCode={isoCode} size={size} style={style} />;
}

export default Flag;
