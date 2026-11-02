import { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HistoryScreen() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const router = useRouter();

  const loadSnaps = async () => {
    try {
      const data = await AsyncStorage.getItem("@snap_trail_history");
      if (data) {
        setSnaps(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  useEffect(() => {
    loadSnaps();
  }, []);

  return (
    <View className="flex-1 bg-slate-950 p-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-extrabold text-white">Your Trails 🗺️</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
        >
          <Text className="text-slate-300 font-medium">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Snap List */}
      {snaps.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500 text-base">No saved snaps yet. Go take one!</Text>
        </View>
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex-row items-center">
              <Image source={{ uri: item.uri }} className="w-20 h-20 rounded-xl bg-slate-800 mr-4" />
              <View className="flex-1">
                <Text className="text-emerald-400 font-semibold text-xs mb-1">📍 {item.lat}, {item.lon}</Text>
                <Text className="text-slate-400 text-xs">Captured at {item.timestamp}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}