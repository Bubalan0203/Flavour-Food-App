import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

export default function InputScreen() {
  const [ingredients, setIngredients] = useState("");
  const [foodType, setFoodType] = useState("North Indian");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!ingredients.trim()) {
      Alert.alert("Please enter some ingredients");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, food_type: foodType }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: "/results",
          params: { data: JSON.stringify(data) },
        });
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Ingredients</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. tomato, onion, garlic"
        value={ingredients}
        onChangeText={setIngredients}
      />

      <Text style={styles.label}>Select Cuisine Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={foodType}
          onValueChange={(itemValue: string) => setFoodType(itemValue)}
        >
          <Picker.Item label="North Indian" value="North Indian" />
          <Picker.Item label="South Indian" value="South Indian" />
          <Picker.Item label="Street Food" value="Street Food" />
          <Picker.Item label="Tiffin Recipes" value="Tiffin" />
        </Picker>
      </View>

      <Button title={loading ? "Searching..." : "Find Recipes"} onPress={handleSearch} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 6, marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 20, overflow: "hidden"
  },
});
