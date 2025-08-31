import React, { useEffect, useState } from "react";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { HStack, View } from "native-base";
import { styles } from "@/src/styles/styles";
import TextComponent from "@components/Lib/Text";
import { ScrollView } from "react-native-gesture-handler";
import { TextInput } from "react-native-element-textinput";
import { useFormik } from "formik";
import { AntDesign } from "@expo/vector-icons";
import { scale } from "react-native-size-scaling";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { useHookstate } from "@hookstate/core";
import checklistStore, { getAllChecklist } from "@components/Checklist/store";
import { TypeTask } from "@/src/types/task";
import objectStore, { getAllObject } from "@components/Object/store";
import { v4 as uuidv4 } from "uuid";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isIOS, isWeb } from "@utils/deviceInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import taskStore from "@components/Task/store";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { AuthContext } from "@/src/provider/AuthProvider";
import groupObjectStore, {
  getAllGroupObject,
} from "@components/GroupObject/store";
interface Props {
  data?: any;
  visible: boolean;
  closeModal: () => void;
  submit: (data: TypeTask) => void;
}

interface IFormErrors {
  name?: string;
  checklist_id?: string;
  list_object?: string;
}

const initData: TypeTask = {
  id: uuidv4(),
  name: "",
  position: "",
  creator: "",
  pic: "",
  started_at: "",
  ended_at: "",
  worker: "",
  process: "",
  checklist_id: "",
  list_object: "",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  // const formattedDate = date.toISOString();
  return date;
}

const ModalControl: React.FC<Props> = ({
  visible,
  data,
  closeModal,
  submit,
}) => {
  const checklistState = useHookstate(checklistStore);
  const objectState = useHookstate(objectStore);
  const taskState = useHookstate(taskStore);
  const groupObjectState = useHookstate(groupObjectStore);

  const { isConnected } = React.useContext(AuthContext);

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // getAllObject({}, isConnected);
      getAllGroupObject({}, isConnected);
      getAllChecklist({}, isConnected);

      if (data) {
        if (!isWeb && !isConnected) {

          formik.values.name = data.name;
          formik.values.list_object = data.list_object;
          setDate(formatDate(data.ended_at as string));
          formik.values.checklist_id = taskState.checklistTask.get() || "";
          // formik.setFieldValue(
          //   "checklist_id",
          //   data.checklist_task[0].checklist_id
          // );

          formik.values.list_object = data.list_object;
          formik.values.ended_at = data.ended_at;
        } else {
          formik.setFieldValue("id", data.id);
          formik.setFieldValue("name", data.name);
          formik.setFieldValue(
            "list_object",
            data.object_task.map((item: any) => item.object_id)
          );
          // formik.values.list_object = data.list_object;
          setDate(formatDate(data.ended_at as string));
          formik.setFieldValue(
            "checklist_id",
            data.checklist_task[0].checklist_id
          );
          // formik.setFieldValue("list_object", data.checklist_task[0].checklist_id)
          formik.setFieldValue("ended_at", data.ended_at);
        }
      } else {
        resetForm();
      }
    }
  }, [visible]);

  const resetForm = () => {
    formik.resetForm();
    formik.values.id = uuidv4();
  };

  const formik = useFormik({
    initialValues: initData,
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.name === "") {
        error.name = "Không được để trống ô này";
      }
      if (values.checklist_id === "") {
        error.checklist_id = "Không được để trống ô này";
      }
      if (values.list_object === "") {
        error.list_object = "Không được để trống ô này";
      }
      return error;
    },
    onSubmit: async (_values) => {
      let creator;
      if (!isWeb) creator = await AsyncStorage.getItem("username");
      else creator = await localStorage.getItem("username");

      submit({
        ..._values,
        id: data ? data.id : uuidv4(),
        checklist_id: data
          ? _values.checklist_id || taskState.checklistTask.get()
          : _values.checklist_id,

        list_object: data
          ? _values.list_object || taskState.checklistTask.get()
          : _values.list_object,
        // list_object: data
        //   ? _values.list_object || taskState.objectTask.get()
        //   : _values.list_object,
        started_at: new Date().toString(),
        ended_at: date.toString(),
        creator: creator?.toString(),
      });
      resetForm();
      closeModal();
    },
  });

  // if (data) {
  //   formik.values.checklist_id = taskState.checklistTask.get();
  //   formik.values.list_object = taskState.objectTask.get();
  // }

  // dropdown

  const dataChecklist = checklistState.data.get().map((item: any) => {
    return { value: item.id.toString(), label: item.name };
  });

  const [isFocus, setIsFocus] = React.useState<boolean>(false);
  const dataGroupObject = groupObjectState.data.get().map((item: any) => {
    return { value: item.id, label: item.name };
  });

  const millisecondsInADay = 1000 * 60 * 60 * 24;
  const [date, setDate] = React.useState(
    new Date(Date.now() + millisecondsInADay)
  );
  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setDate(currentDate);
    setShow(false);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={styles.wrapBox}>
          <TextComponent style={styles.title} bold fontSize={18}>
            {data ? "Cập nhật thông tin" : "Thêm mới nhiệm vụ"}
          </TextComponent>
          <ScrollView>
            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
              label={"Tên nhiệm vụ"}
              placeholder={"Nhập tên nhiệm vụ"}
              placeholderTextColor="gray"
              textError={formik.errors.name}
            />

            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={dataChecklist}
              search
              maxHeight={scale(200)}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Chọn checklist" : "..."}
              searchPlaceholder="Nhập checklist"
              value={
                data
                  ? formik.values.checklist_id || taskState.checklistTask.get()
                  : formik.values.checklist_id
              }
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                formik.setFieldValue("checklist_id", item.value);
                setIsFocus(false);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color={isFocus ? "blue" : "black"}
                  name="Safety"
                  size={scale(20)}
                />
              )}
            />

            <HStack space={4} mt={5} mb={2} justifyContent={"flex-start"} alignItems={"center"}>
              <TextComponent style={styles.inputStyle} fontSize={18}>
                Thời hạn hoàn thành:
              </TextComponent>
              {isWeb ? (
                <DatePicker
                  selected={date}
                  dateFormat="dd/MM/yyyy"
                  onChange={(date) => onChange(null, date)}
                />
              ) : isIOS ? (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={"datetime"}
                  is24Hour={true}
                  onChange={onChange}
                  dateFormat="DD/MM/YYYY"
                />
              ) : (
                <HStack space={4} mt={14} >
                  <Button mode="outlined" onPress={() => setShow(true)}

                  >
                    {moment(date).format("DD/MM/YYYY")}
                  </Button>
                  {show && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={date}
                      mode={"date"}
                      onChange={onChange}
                    />
                  )}
                </HStack>
              )}
            </HStack>
            <Divider style={{ height: 1, borderColor: "black" }} />

            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={dataGroupObject}
              search
              maxHeight={scale(200)}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Chọn nhóm đối tượng" : "..."}
              searchPlaceholder="Nhập nhóm đối tượng"
              value={
                data
                  ? formik.values.list_object || taskState.checklistTask.get()
                  : formik.values.list_object
              }
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                formik.setFieldValue("list_object", item.value);
                setIsFocus(false);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color={isFocus ? "blue" : "black"}
                  name="Safety"
                  size={scale(20)}
                />
              )}
            />

            {/* <MultiSelect
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              search
              data={dataGroupObject}
              labelField="label"
              valueField="value"
              placeholder="Lựa chọn danh sách đối tượng để thực hiện"
              searchPlaceholder="Search..."
              value={
                data
                  ? formik.values.list_object || taskState.objectTask.get()
                  : formik.values.list_object
              }
              onChange={
                (item) => {
                  formik.setFieldValue("list_object", item);
                }
                // setSelected2(item);
              }
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color="black"
                  name="Safety"
                  size={scale(20)}
                />
              )}
              selectedStyle={styles.selectedStyle}
            /> */}

            <HStack space={4} mt={14} justifyContent={"flex-end"}>
              <Button mode="outlined" onPress={closeModal}>
                Hủy
              </Button>
              <Button mode="contained" onPress={() => formik.handleSubmit()}>
                {data ? "Cập nhật" : "Thêm mới"}
              </Button>
            </HStack>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );
};

export default ModalControl;
