import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location"; // Make sure Location is imported!
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CameraScreen() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  
  const { lat, lon } = useLocalSearchParams<{ lat: string; lon: string }>();
  const router = useRouter();
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View className="flex-1 bg-slate-950" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <Text className="text-white text-xl font-bold mb-3 text-center">Camera Access Needed</Text>
        <Text className="text-slate-400 text-center mb-6">
          SnapTrail needs camera access so you can snap photos of your journey.
        </Text>
        <TouchableOpacity 
          onPress={requestPermission} 
          className="bg-blue-600 w-full py-4 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-lg">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
        
        // 1. Default address fallback
        let locationName = "Unknown Location";

        if (lat && lon) {
          try {
            // 2. Perform Reverse Geocoding
            const addressResponse = await Location.reverseGeocodeAsync({
              latitude: Number(lat),
              longitude: Number(lon),
            });

            if (addressResponse.length > 0) {
              const addr = addressResponse[0];
              // Build a friendly string like "City, Region" or fallback to street name
              locationName = `${addr.city || addr.subregion || addr.name || "Explore Point"}, ${addr.region || ""}`;
            }
          } catch (geoError) {
            console.log("Geocoding failed, using coordinates instead", geoError);
          }
        }

        // 3. Create our enhanced snap object
        const newSnap = {
          id: Date.now().toString(),
          uri: photo.uri,
          lat: lat ? Number(lat).toFixed(4) : "0.0000",
          lon: lon ? Number(lon).toFixed(4) : "0.0000",
          address: locationName,
          timestamp: new Date().toLocaleTimeString(),
        };

        // 4. Save to AsyncStorage
        const existingSnapsJson = await AsyncStorage.getItem("@snap_trail_history");
        const existingSnaps = existingSnapsJson ? JSON.parse(existingSnapsJson) : [];

        const updatedSnaps = [newSnap, ...existingSnaps];
        await AsyncStorage.setItem("@snap_trail_history", JSON.stringify(updatedSnaps));

        router.back();
      } catch (error) {
        console.error("Failed to take or save picture:", error);
      } finally {
        setCapturing(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef}>
        <View className="absolute top-12 left-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
          <Text className="text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">📍 Tagged Location</Text>
          <Text className="text-white font-mono text-sm">
            {lat ? `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}` : "Fetching GPS..."}
          </Text>
        </View>

        <View className="absolute bottom-10 left-0 right-0 flex-row justify-around items-center px-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-slate-800/80 px-5 py-3 rounded-xl border border-slate-700"
          >
            <Text className="text-white font-medium">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={takePicture}
            disabled={capturing}
            className="w-20 h-20 rounded-full border-4 border-white items-center justify-center bg-white/20 active:bg-white/40"
          >
            {capturing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View className="w-16 h-16 rounded-full bg-white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setFacing(current => (current === "back" ? "front" : "back"))}
            className="bg-slate-800/80 px-5 py-3 rounded-xl border border-slate-700"
          >
            <Text className="text-white font-medium">Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}