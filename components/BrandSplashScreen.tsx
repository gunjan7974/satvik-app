import { View, Image, StyleSheet, StatusBar } from "react-native";
import LottieView from "lottie-react-native";

export default function BrandSplashScreen() {
  return (
    <View style={styles.container}>
      
      <StatusBar backgroundColor="#E6F4FE" barStyle="dark-content" />

      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <LottieView
        source={require("../assets/animations/wave.json")}
        autoPlay
        loop
        speed={0.7}
        style={styles.wave}
      />

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  wave: {
    width: 140,
    height: 80,
    marginTop: 20,
  },
});