import { View, Text } from "react-native";
import { Colors } from "../../constants/colors";

type FoodCardProps = {
  name: string;
  price: string;
};

export default function FoodCard({ name, price }: FoodCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.bgWhite,
        borderRadius: 14,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.borderLight,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: Colors.textDark,
        }}
      >
        {name}
      </Text>

      <Text style={{ color: Colors.primary, marginTop: 6 }}>
        {price}
      </Text>
    </View>
  );
}
