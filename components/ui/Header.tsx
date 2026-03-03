import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import Header from "../../components/ui/Header";


export default function Header() {
  return (
    
    <View style={styles.container}>
      {/* Left: Menu icon */}
      <TouchableOpacity>
        <Ionicons name="menu" size={28} color="#000" />
      </TouchableOpacity>

      {/* Right: Profile image */}
      <TouchableOpacity>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }} // demo image
          style={styles.profile}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.bgMain,
  },
  profile: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});
