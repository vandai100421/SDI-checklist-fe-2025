import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SecondScreen from "../screens/SecondScreen";
import MainTabs from "./MainTabs";
import DetailChecklist from "../screens/DetailChecklist";
import TaskDetail from "../screens/TaskDetail";
import TaskObjectDetail from "../screens/TaskObjectDetail";
import Profile from "../screens/Profile";
import Object from "../screens/Object";

const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="SecondScreen" component={SecondScreen} />
      <MainStack.Screen name="DetailChecklist" component={DetailChecklist} />
      <MainStack.Screen name="DetailGroupObject" component={Object} />
      <MainStack.Screen name="TaskDetail" component={TaskDetail} />
      <MainStack.Screen name="TaskObjectDetail" component={TaskObjectDetail} />
      <MainStack.Screen name="Profile" component={Profile} />
    </MainStack.Navigator>
  );
};

export default Main;
