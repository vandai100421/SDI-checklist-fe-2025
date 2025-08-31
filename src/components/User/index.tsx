import * as React from "react";
import {
  Dimensions,
} from "react-native";

import ListUser from "@components/User/subcomponents/ListUser";

const initialLayout = {
  width: Dimensions.get("window").width,
};

const User = () => {

  return (
    <ListUser />
  );
};

export default User;
