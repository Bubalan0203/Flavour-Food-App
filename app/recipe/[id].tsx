import {
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity
} from "react-native";

import { Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/AuthContext";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const db = getFirestore(app);

export default function RecipeView() {
  const { title, youtube, id } = useLocalSearchParams();
  const [steps, setSteps] = useState<string[]>([]);
  const [originalEnglishSteps, setOriginalEnglishSteps] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [isReadyPromptShown, setIsReadyPromptShown] = useState(false);
  const [userReady, setUserReady] = useState<null | boolean>(null);
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/generate-steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, youtube })
        });
        const text = await res.text();
        const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
        setSteps(lines);
        setOriginalEnglishSteps(lines);
      } catch (err) {
        console.error(err);
        setSteps(["❌ Failed to generate recipe steps."]);
      }
    };

    if (!isFetching.current) {
      isFetching.current = true;
      fetchSteps();
    }
  }, []);

  useEffect(() => {
    const checkSaved = async () => {
      if (!user || !id) return;
      const docRef = doc(db, "users", user.uid, "favorites", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAlreadySaved(true);
      }
    };

    checkSaved();
  }, [user, id]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Please log in to save favorites.");
      return;
    }

    try {
      const recipeRef = doc(db, "users", user.uid, "favorites", id as string);
      await setDoc(recipeRef, {
        title,
        youtube,
        steps: steps.join("\n")
      });
      setAlreadySaved(true);
      Alert.alert("✅ Saved to favorites!");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error saving to favorites.");
    }
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map((item: any[]) => item[0]).join(" ");
    } catch (error) {
      console.error("Translation error:", error);
      return "❌ Retry";
    }
  };

  const handleLanguageChange = async (lang: string) => {
    setSelectedLang(lang);
    if (lang === "en") {
      setSteps(originalEnglishSteps);
    } else {
      const joined = originalEnglishSteps.join("\n");
      const translated = await translateText(joined, lang);
      const splitSteps = translated.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
      setSteps(splitSteps);
    }
  };
  

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPickedImage(uri);
      setUploading(true);
  
      const filename = uri.split("/").pop() || "dish.jpg";
      const match = /\.(\w+)$/.exec(filename ?? "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;
  
      const formData = new FormData();
  
      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], filename, { type });
        formData.append("file", file);
      } else {
        formData.append("file", {
          uri,
          name: filename,
          type,
        } as any);
      }
  
      try {
        const response = await fetch("http://192.168.234.1:8000/api/review-dish-image", {
          method: "POST",
          body: formData,
          headers: Platform.OS === "web" ? {} : { "Content-Type": "multipart/form-data" },
        });
  
        const data = await response.json();
        setFeedback(data.feedback);
      } catch (error) {
        console.error("Upload failed:", error);
        setFeedback("❌ Failed to analyze the image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };
  
  
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{title}</Text>

      <Button title="▶️ WATCH ON YOUTUBE" onPress={() => Linking.openURL(youtube as string)} />
      <View style={styles.spacer} />

      {alreadySaved ? (
        <Text style={styles.savedText}>✅ Saved to favorites</Text>
      ) : (
        <Button title="⭐ SAVE TO FAVORITES" onPress={handleSave} />
      )}

      <Text style={styles.stepsTitle}>🧠 AI-Powered Recipe Steps</Text>

      <Picker
        selectedValue={selectedLang}
        style={styles.picker}
        onValueChange={(itemValue) => handleLanguageChange(itemValue)}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Hindi" value="hi" />
        <Picker.Item label="Tamil" value="ta" />
        <Picker.Item label="Telugu" value="te" />
        <Picker.Item label="Malayalam" value="ml" />
        <Picker.Item label="Kannada" value="kn" />
      </Picker>

      {steps.length === 0 ? (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />
      ) : (
        steps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <Text style={styles.stepText}>
              <Text style={styles.stepNumber}>{index + 1}. </Text>
              {step.replace(/^(\d+\.\s*)/, "")}
            </Text>
          </View>
        ))
      )}

      {steps.length > 0 && (
        <>
          {(!isReadyPromptShown || userReady === false) && (
            <View style={{ marginTop: 20 }}>
              {userReady === false && (
                <Text style={{ textAlign: "center", fontStyle: "italic", marginBottom: 12 }}>
                  ⏳ No worries! Take your time, I’ll be here when you're ready.
                </Text>
              )}
              <Text style={{ fontSize: 18, fontWeight: "500", textAlign: "center" }}>
                👨‍🍳 Is your food ready?
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12 }}>
                <Button title="Yes ✅" onPress={() => { setIsReadyPromptShown(true); setUserReady(true); }} />
                <Button title="Not Yet ⏳" onPress={() => { setIsReadyPromptShown(true); setUserReady(false); }} />
              </View>
            </View>
          )}

          {isReadyPromptShown && userReady === true && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>📸 Upload a photo of your dish</Text>

              {!pickedImage && (
                <TouchableOpacity
                  onPress={handleImageUpload}
                  style={{
                    backgroundColor: "#e2e8f0",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center"
                  }}
                >
                  <Text>Upload Dish Image</Text>
                </TouchableOpacity>
              )}

              {pickedImage && (
                <>
                  <Image
                    source={{ uri: pickedImage }}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      height: 200,
                      borderRadius: 12
                    }}
                  />
                  {uploading ? (
                    <ActivityIndicator style={{ marginTop: 16 }} size="large" color="#007aff" />
                  ) : feedback ? (
                    <Text style={{ marginTop: 16, fontSize: 16, fontStyle: "italic", color: "#333" }}>
                      🧠 {feedback}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 24, marginBottom: 16, textAlign: "center" },
  stepsTitle: { fontSize: 20, fontWeight: "600", marginTop: 24, marginBottom: 8 },
  spacer: { height: 12 },
  savedText: { fontSize: 16, fontWeight: "600", color: "green", textAlign: "center", marginVertical: 12 },
  picker: { marginBottom: 12, backgroundColor: "#f3f4f6", borderRadius: 8 },
  stepCard: { backgroundColor: "#f1f5f9", padding: 12, marginVertical: 6, borderRadius: 8, elevation: 2 },
  stepText: { fontSize: 16, color: "#333" },
  stepNumber: { fontWeight: "bold" }
});
