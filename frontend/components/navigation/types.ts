import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { ImageURISource } from "react-native";

// Icon types
export type IconName = keyof typeof Ionicons.glyphMap;

export interface TabIconConfig {
  name: IconName;
  focusedName?: IconName;
}

export interface TabImageConfig {
  source: ImageURISource;
  size?: number;
}

export type TabIconType = TabIconConfig | TabImageConfig;

// Check if config is an image
export const isImageConfig = (config: TabIconType): config is TabImageConfig => {
  return "source" in config;
};

// Tab item configuration
export interface TabItemConfig {
  name: string;
  label: string;
  icon: TabIconType;
  showLabel?: boolean;
  isCenter?: boolean;
}

// TabBarIcon props
export interface TabBarIconProps {
  icon: TabIconType;
  focused: boolean;
  color: string;
  size?: number;
  isCenter?: boolean;
}

// TabBarItem props
export interface TabBarItemProps {
  route: {
    key: string;
    name: string;
  };
  index: number;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  icon: TabIconType;
  showLabel?: boolean;
  isCenter?: boolean;
}

// Custom TabBar props
export interface CustomTabBarProps extends BottomTabBarProps {
  tabs: TabItemConfig[];
}
