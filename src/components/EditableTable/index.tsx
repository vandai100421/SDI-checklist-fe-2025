import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Button } from "react-native";

const EditableTable = () => {
  // Khởi tạo dữ liệu bảng
  const [tableData, setTableData] = useState([
    { id: "1", column1: "", column2: "", column3: "" },
    { id: "2", column1: "", column2: "", column3: "" },
    { id: "3", column1: "", column2: "", column3: "" },
  ]);

  // Trạng thái lưu chiều cao của từng hàng
  const [rowHeights, setRowHeights] = useState({});

  // Xử lý cập nhật giá trị ô nhập liệu
  const handleInputChange = (id, column, value) => {
    setTableData((prevData) =>
      prevData.map((row) =>
        row.id === id ? { ...row, [column]: value } : row
      )
    );
  };

  // Cập nhật chiều cao lớn nhất trong mỗi hàng
  const handleContentSizeChange = (id, column, contentHeight) => {
    setRowHeights((prevHeights) => {
      const currentHeight = prevHeights[id] || 0;
      return {
        ...prevHeights,
        [id]: Math.max(currentHeight, contentHeight),
      };
    });
  };

  // Render một hàng
  const renderRow = ({ item }) => (
    <View style={styles.row}>
      {["column1", "column2", "column3"].map((col) => (
        <TextInput
          key={col}
          style={[
            styles.input,
            { height: rowHeights[item.id] || 40 }, // Áp dụng chiều cao đồng nhất
          ]}
          value={item[col]}
          placeholder={`Cột ${col.slice(-1)}`}
          multiline
          scrollEnabled={false} // Tắt cuộn
          onContentSizeChange={(event) =>
            handleContentSizeChange(
              item.id,
              col,
              event.nativeEvent.contentSize.height
            )
          }
          onChangeText={(text) => handleInputChange(item.id, col, text)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bảng Nhập Liệu</Text>
      <FlatList
        data={tableData}
        renderItem={renderRow}
        keyExtractor={(item) => item.id}
      />
      <Button title="In Dữ Liệu" onPress={() => console.log(tableData)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    textAlignVertical: "top", // Đảm bảo văn bản căn trên
  },
});

export default EditableTable;
