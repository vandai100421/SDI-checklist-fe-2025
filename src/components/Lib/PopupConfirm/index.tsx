import { Modal, Text, View } from 'react-native'
import React, { FC } from 'react'
import { HStack } from 'native-base';
import { Button } from 'react-native-paper';
import TextComponent from '../Text';
import { styles } from 'src/styles/styles';

type Props = {
    visible: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void
}

const PopupConfirm: FC<Props> = ({ visible, title, message, onConfirm, onCancel }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{
                    backgroundColor: 'white', padding: 20, borderRadius:
                        10
                }}>

                    <TextComponent bold >{title}</TextComponent>

                    <TextComponent >{message}</TextComponent>

                    <HStack space={4} mt={14} justifyContent={"flex-end"}>
                        <Button mode="outlined" onPress={onCancel}>
                            Hủy
                        </Button>
                        <Button mode="contained" onPress={onConfirm}>
                            Đồng ý
                        </Button>
                    </HStack>
                </View>
            </View>
        </Modal>
    )
}

export default PopupConfirm