import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function Results() {
  const { data } = useLocalSearchParams();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data as string);
        setRecipes(parsed);
      } catch (err) {
        console.error("Failed to parse recipe data:", err);
      }
    }
  }, [data]);

  if (!recipes.length) return <Text>Loading recipes...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Recipes</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>🍽️ {item.title}</Text>
            <Button title="▶️ Watch on YouTube" onPress={() => router.push(item.youtube)} />
            <View style={{ height: 10 }} />
            <Button
              title="📖 View Recipe"
              onPress={() =>
                router.push({
                  pathname: "/recipe/[id]",
                  params: {
                    id: item.id,
                    title: item.title,
                    youtube: item.youtube
                  },
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: { marginBottom: 24, backgroundColor: "#f8f8f8", padding: 12, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
});
