import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signOut,
    User,
  } from "firebase/auth";
  import * as Google from "expo-auth-session/providers/google";
  import * as WebBrowser from "expo-web-browser";
  import { auth } from "../firebaseConfig";
  import { app } from "../firebaseConfig";
  import { getFirestore, doc, setDoc } from "firebase/firestore";
  const db = getFirestore(app);

  
  WebBrowser.maybeCompleteAuthSession();
  
  interface AuthContextType {
    user: User | null;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
  }
  
  const AuthContext = createContext<AuthContextType | null>(null);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
  
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: "718285938101-85e7su9vhd2ncm3rl9dmsiqk18n2klg6.apps.googleusercontent.com",
        webClientId: "718285938101-85e7su9vhd2ncm3rl9dmsiqk18n2klg6.apps.googleusercontent.com",
        responseType: "id_token",
        scopes: ["profile", "email"],
        useProxy: true, // ✅ move it here
      } as any); // suppress TS warning
      
  
    // 1. Firebase login listener
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        console.log("Logged in user:", u);
      });
      return unsubscribe;
    }, []);
  
    // 2. Google login callback
    useEffect(() => {
        const authenticate = async () => {
          if (response?.type === "success") {
            const idToken =
              response.authentication?.idToken || response.params?.id_token;
      
            if (idToken) {
              try {
                const credential = GoogleAuthProvider.credential(idToken);
                const result = await signInWithCredential(auth, credential);
                const user = result.user;
      
                console.log("Firebase login successful");
      
                // ✅ Save user details to Firestore
                await setDoc(
                  doc(db, "users", user.uid),
                  {
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: new Date().toISOString(),
                  },
                  { merge: true }
                );
              } catch (err) {
                console.error("Firebase login error:", err);
              }
            } else {
              console.warn("No ID token found in response.");
            }
          } else if (response?.type === "dismiss") {
            console.warn("Login popup was dismissed.");
          }
        };
      
        authenticate();
      }, [response]);

      
    // 3. Google Sign-In
    const signInWithGoogle = async () => {
        if (!request) {
          console.warn("Google AuthRequest not ready");
          return;
        }
        const result = await promptAsync();
        console.log("Auth response:", result);
      };
      
    // 4. Logout
    const logout = async () => {
      await signOut(auth);
      console.log("Logged out");
    };
  
    return (
      <AuthContext.Provider value={{ user, signInWithGoogle, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
  