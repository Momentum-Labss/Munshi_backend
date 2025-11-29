import { Tabs, usePathname } from "expo-router";
import { TabBar, TabItemConfig } from "@/components/navigation";
import { GlobalVoiceWidget } from "@/components/voice";

// Tab configuration
const tabs: TabItemConfig[] = [
  {
    name: "home",
    label: "",
    icon: {
      name: "home-outline",
      focusedName: "home",
    },
    showLabel: true,
  },
  {
    name: "munshi",
    label: "",
    icon: {
      source: require("../../assets/munshi.png"),
      size: 56,
    },
    showLabel: false,
    isCenter: true,
  },
  {
    name: "calculator",
    label: "",
    icon: {
      name: "calculator-outline",
      focusedName: "calculator",
    },
    showLabel: true,
  },
];

export default function TabsLayout() {
  const pathname = usePathname();
  const isMunshiTab = pathname.includes("/munshi");
  const isCalculatorTab = pathname.includes("/calculator");

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <TabBar {...props} tabs={tabs} />}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="munshi" />
        <Tabs.Screen name="calculator" />
      </Tabs>

      {/* Global Voice Widget - Hidden on Munshi and Calculator tabs */}
      {!isMunshiTab && !isCalculatorTab && <GlobalVoiceWidget />}
    </>
  );
}
