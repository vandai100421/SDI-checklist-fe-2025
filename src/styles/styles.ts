import { COLORS } from "@config";
import { colors } from "@theme";
import { background } from "native-base/lib/typescript/theme/styled-system";
import { StyleSheet } from "react-native";
import { scale } from "react-native-size-scaling";
export const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
  },
  // cell: { flex: 1, justifyContent: "center" },
  // center: { flex: 1, justifyContent: "center" },
  cell: { justifyContent: "center", paddingHorizontal: 8, width: "100%", flexShrink: 1 }, // Loại bỏ flex: 1
  center: { justifyContent: "center", paddingHorizontal: 8 },
  textWrap: { flexShrink: 1 }, // Đảm bảo nội dung dài bị ngắt dòng nếu cần

  titleCell: { fontSize: 28, fontWeight: "bold" },
  detailText: { fontSize: 20 },
  detailTitle: { fontSize: 20, fontWeight: "bold" },
  wrapBox: {
    // maxWidth: 600,
    backgroundColor: "#F8F8FF",
    margin: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 16,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  title: {
    alignSelf: "center",
    marginVertical: 12,
    color: "gray",
  },
  titleCard: {
    alignSelf: "center",
    color: "gray",
  },
  textinput: {
    alignItems: "stretch",
    backgroundColor: "white",
    marginTop: 20,
    height: 60,
    paddingHorizontal: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  inputStyle: { fontSize: 16, lineHeight: 40 },
  labelStyle: { fontSize: 14 },
  placeholderStyle: { fontSize: 16 },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  textErrorStyle: { fontSize: 14 },
  button: {
    backgroundColor: "white",
    marginTop: 32,
    height: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  buttonModal: {
    marginTop: 14,
    height: 50,
    shadowColor: "#000",
    width: "auto",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textOr: {
    alignSelf: "center",
    marginTop: 16,
    color: "gray",
  },
  dropdown: {
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    marginTop: 36,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  imageStyle: {
    width: 24,
    height: 24,
  },
  locale: {
    position: "absolute",
    right: 30,
    top: 50,
  },
  input: {
    height: 55,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#DDDDDD",
  },

  selectedStyle: {
    borderRadius: 12,
  },
  table: {
    width: "100%",
    // overflowX: "scroll"
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 12,
  },
  checkbox: {
    margin: 4,
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },

  background: {
    backgroundColor: colors.transparent
  },

  checkBox: {
    backgroundColor: "orange",
    height: "100%",
  },
});
