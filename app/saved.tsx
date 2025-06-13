import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../hooks/AuthContext";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useRouter } from "expo-router";

const db = getFirestore(app);

export default function SavedScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      const snapshot = await getDocs(collection(db, "users", user.uid, "favorites"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(data);
    };
    fetchFavorites();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "favorites", id));
      setFavorites(favorites.filter(f => f.id !== id));
      Alert.alert("Deleted", "Recipe removed from favorites.");
    } catch (error) {
      console.error("Error deleting:", error);
      Alert.alert("Error", "Couldn't delete recipe.");
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
                  params: {
                    id: item.id,
                    title: item.title,
                    youtube: item.youtube,
                  },
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
