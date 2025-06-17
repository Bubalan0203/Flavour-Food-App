import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../hooks/AuthContext";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useRouter } from "expo-router";

const db = getFirestore(app);

export default function SavedScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]); // Explicit type definition here
  const router = useRouter();

  // Fetch saved favorites
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "favorites"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFavorites(data); // Store the fetched data in state
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [user]); // Only fetch favorites when user changes

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      // Deleting from Firestore
      await deleteDoc(doc(db, "users", user.uid, "favorites", id));

      // Update the local state after deletion
      setFavorites(favorites.filter((f) => f.id !== id)); // Remove from local state
      Alert.alert("Deleted", "Recipe removed from favorites.");
    } catch (error) {
      console.error("Error deleting:", error);
      Alert.alert("Error", "Couldn't delete recipe.");
    }
  };

  const handleSave = async (item: any) => {
    if (!user) {
      Alert.alert("Please log in to save favorites.");
      return;
    }

    try {
      // Create a new recipe object to save in Firestore
      const newRecipe = {
        title: item.title,
        youtube: item.youtube,
        steps: item.steps.join("\n"), // Adjust according to the structure
        foodType: item.foodType,  // Save food type
        image: item.image || "default_image_url", // You can include an image URL if available
      };

      // Save to Firestore with foodType as a field
      const recipeRef = doc(db, "users", user.uid, "favorites", item.id);
      await setDoc(recipeRef, newRecipe);

      // Update the local favorites list to include the new recipe
      setFavorites((prevFavorites) => [...prevFavorites, { id: item.id, ...newRecipe }]);

      Alert.alert("✅ Saved to favorites!");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error saving to favorites.");
    }
  };

  if (!user) return <Text>Please log in to view favorites.</Text>;
  if (favorites.length === 0) return <Text>No saved recipes yet.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Saved Recipes</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/recipe/[id]",
                  params: { id: item.id, title: item.title, youtube: item.youtube },
                })
              }
            >
              <Text style={styles.name}>{item.title} 💛</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>🗑️ Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
  },
  image: { width: "100%", height: 180, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: "600", marginTop: 8 },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#ff4c4c",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "bold" },
});
