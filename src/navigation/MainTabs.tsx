import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { themeColor, useTheme } from "react-native-rapi-ui";
import TabBarIcon from "../components/utils/TabBarIcon";
import TabBarText from "../components/utils/TabBarText";

import Home from "../screens/Home";
import About from "../screens/About";
import Profile from "../screens/Profile";
import Task from "../screens/Task";
import Checklist from "../screens/Checklist";
import Object from "../screens/Object";
import User from "../screens/User";
import GroupObject from "../screens/GroupObject";
import { AuthContext } from "../provider/AuthProvider";
import { useFocusEffect } from "expo-router";
// import Home from "@components/Home";

const Tabs = createBottomTabNavigator();
const MainTabs = () => {
  const { isDarkmode } = useTheme();
  const { isAdmin, isConnected, checkOnline, checkIsAdmin } = React.useContext(AuthContext);

  useEffect(() => {
    checkIsAdmin();
  }, isAdmin)
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: isDarkmode ? themeColor.dark100 : "#c0c0c0",
          backgroundColor: isDarkmode ? themeColor.dark200 : "#ffffff",
        },
      }}
    >
      {/* these icons using Ionicons */}
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Home" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"md-home"} />
          ),
        }}
      />
      <Tabs.Screen
        name="Task"
        component={Task}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Task" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"clipboard"} />
          ),
        }}
      />

      {isAdmin && <Tabs.Screen
        name="User"
        component={User}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="User" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"people"} />
          ),
        }}
      />}
      <Tabs.Screen
        name="Checklist"
        component={Checklist}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Checklist" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"checkbox"} />
          ),
        }}
      />
      <Tabs.Screen
        name="GroupObject"
        component={GroupObject}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Object" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"construct"} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export default MainTabs;
