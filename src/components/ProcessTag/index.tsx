import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

type Props = {
    status: string;
}

const ProcessTag: React.FC<Props> = ({ status }) => {
    const isCompleted = status === 'Đã hoàn thành';

    return (
        <View style={[styles.tag, { backgroundColor: isCompleted ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.text}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default ProcessTag;
