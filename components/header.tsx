import { View, Text } from "react-native";

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <View style={{ paddingVertical: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        {title}
      </Text>
    </View>
  );
}
