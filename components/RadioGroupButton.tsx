import React, { FC, useState } from "react";
import { View, Text, Pressable } from "react-native";


type Props = {
    label: string;
    selected: boolean;
    onPress: () => void
}

const CustomRadioButton: FC<Props> = ({ label, selected, onPress }) => {
    return (
        <Pressable
            onPress={onPress}
            style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}
        >
            <View
                style={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selected ? "#007BFF" : "#ccc",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 4,
                }}
            >
                {selected && (
                    <View
                        style={{
                            height: 12,
                            width: 12,
                            borderRadius: 6,
                            backgroundColor: "#007BFF",
                        }}
                    />
                )}
            </View>
            <Text>{label}</Text>
        </Pressable>
    );
};


export default CustomRadioButton;