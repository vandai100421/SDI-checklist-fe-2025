import React from "react";
import { View } from "react-native";
import { Center, HStack, useColorMode, VStack } from "native-base";
import { Card } from "react-native-paper";
import { styles } from "@styles/styles";
import TextComponent from "@components/Lib/Text";
import { scale } from "react-native-size-scaling";
// import { background } from "native-base/lib/typescript/theme/styled-system";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface Props {
  title: string;
  value: number;
  iconName?: string;
  iconColor?: string;
}

const StatisticCard: React.FC<Props> = ({ title, value, iconName }) => {

  return (
    <View style={{ margin: 8 }}>
      <Card>
        <HStack
          space={4}
          p={4}
        >
          <Center p="4">
            <FontAwesome5 style={styles.icon} name={iconName || "tasks"} size={scale(24)} color="black" />
          </Center>
          <VStack space={2}>
            <View>
              <TextComponent style={styles.cell} fontSize={20}>
                {title}
              </TextComponent>
            </View>
            <View>
              <TextComponent style={styles.titleCard} bold fontSize={24}>
                {value}
              </TextComponent>
            </View>
          </VStack>
        </HStack>
      </Card>
    </View>

  );
};

export default StatisticCard;
