import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../hooks/AuthContext";
import { router } from "expo-router";

export default function Home() {
  const { user, logout } = useAuth();

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.displayName} 👋</Text>
      <Text style={styles.subtitle}>You're logged in to BachelorChef</Text>

      <Button title="Start Cooking" onPress={() => router.push("/input")} />
      <View style={{ marginTop: 20 }}>
      <Button
        title="View Saved Recipes"
         onPress={() => router.push("/saved")}
        />
</View>
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={logout} color="#FF4C4C" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
});
