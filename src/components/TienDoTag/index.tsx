import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

type Props = {
    status: string; // dạng "x/y", ví dụ: "2/5"
};

const TienDoTag: React.FC<Props> = ({ status }) => {
    const [x, y] = status.split('/').map(Number);

    let bgColor = '#FFEB3B'; // Mặc định: vàng
    if (x === y && x !== 0) {
        bgColor = '#4CAF50'; // xanh lá
    } else if (x !== 0 && x !== y) {
        bgColor = '#FF9800'; // cam
    }

    return (
        <View style={[styles.tag, { backgroundColor: "white", borderColor: bgColor }]}>
            <Text style={styles.text}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    text: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default TienDoTag;
