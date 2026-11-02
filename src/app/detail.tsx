import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
  const router = useRouter();
  
  const { id, uri, address, lat, lon, timestamp, isFavorite: initialFavorite } = useLocalSearchParams<{
    id: string;
    uri: string;
    address: string;
    lat: string;
    lon: string;
    timestamp: string;
    isFavorite: string;
  }>();

  const [isFavorite, setIsFavorite] = useState(initialFavorite === "true");

  // Toggle favorite status and save to AsyncStorage
  const handleToggleFavorite = async () => {
    try {
      const newFavStatus = !isFavorite;
      setIsFavorite(newFavStatus);

      const data = await AsyncStorage.getItem("@snap_trail_history");
      if (data) {
        const snaps = JSON.parse(data);
        const updatedSnaps = snaps.map((snap: any) => {
          if (snap.id === id) {
            return { ...snap, isFavorite: newFavStatus };
          }
          return snap;
        });
        await AsyncStorage.setItem("@snap_trail_history", JSON.stringify(updatedSnaps));
      }
    } catch (error) {
      console.error("Failed to update favorite status", error);
    }
  };

  const handleShare = async () => {
    try {
      if (!uri) {
        Alert.alert("Error", "Photo file path is missing.");
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: `Check out my snap at ${address || "this location"}!`,
        mimeType: "image/jpeg",
      });
    } catch (error: any) {
      console.error("Detailed sharing error:", error);
      Alert.alert(
        "Sharing Notice", 
        "Native file sharing from cache is restricted inside Expo Go. This will work automatically once you build your standalone app using EAS Build!"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-6 justify-between py-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-extrabold text-white">Snap Details 📸</Text>
        
        <View className="flex-row gap-2">
          {/* Favorite Toggle Button */}
          <TouchableOpacity 
            onPress={handleToggleFavorite}
            className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl active:bg-slate-800"
          >
            <Text className="text-base">{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl active:bg-slate-800 justify-center"
          >
            <Text className="text-slate-300 font-medium text-xs">Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Image Preview Box */}
      <View className="flex-1 my-4 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
      </View>

      {/* Metadata Card */}
      <View className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-4 shadow-lg">
        <Text className="text-emerald-400 font-semibold text-base mb-2" numberOfLines={2}>
          📍 {address || "Unknown Place"}
        </Text>
        <Text className="text-slate-400 text-sm font-mono mb-1">
          Coordinates: {lat}, {lon}
        </Text>
        <Text className="text-slate-500 text-xs">Captured at: {timestamp}</Text>
      </View>

      {/* Action Buttons */}
      <View className="gap-3">
        {/* Share Button */}
        <TouchableOpacity 
          onPress={handleShare}
          className="bg-emerald-600 w-full py-4 rounded-xl items-center shadow-lg active:bg-emerald-700"
        >
          <Text className="text-white font-semibold text-base">Share This Snap 🚀</Text>
        </TouchableOpacity>

        {/* Action Button to Map */}
        <TouchableOpacity 
          onPress={() => router.push("/map")}
          className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg active:bg-blue-700"
        >
          <Text className="text-white font-semibold text-base">View on Journey Map 🗺️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}