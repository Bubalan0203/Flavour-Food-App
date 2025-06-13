import { View, Text, Button, StyleSheet } from "react-native";
import { useEffect, useContext } from "react";
import { useAuth } from "../hooks/AuthContext";
import { router } from "expo-router";
import { LayoutContext } from "./_layout";

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const { isLayoutReady } = useContext(LayoutContext);

  useEffect(() => {
    if (isLayoutReady && user) {
      router.replace("/");
    }
  }, [isLayoutReady, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BachelorChef 👨‍🍳</Text>
      <Text style={styles.subtitle}>Login with Google to get started</Text>
      <Button title="Sign in with Google" onPress={signInWithGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
});
