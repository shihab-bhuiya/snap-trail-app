import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // Function to delete a single snap by ID
  const deleteSnap = async (id: string) => {
    try {
      // Filter out the snap with the matching ID
      const updatedSnaps = snaps.filter((snap) => snap.id !== id);
      
      // Update state
      setSnaps(updatedSnaps);
      
      // Update AsyncStorage filing cabinet
      await AsyncStorage.setItem("@snap_trail_history", JSON.stringify(updatedSnaps));
    } catch (error) {
      console.error("Failed to delete snap", error);
    }
  };

  // Function to clear all history with a confirmation alert
  const clearAllHistory = () => {
    Alert.alert(
      "Clear All Trails",
      "Are you sure you want to delete all your saved snaps? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@snap_trail_history");
              setSnaps([]);
            } catch (error) {
              console.error("Failed to clear history", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-6">
      {/* Header */}
      <View className="flex-row justify-between items-center my-4">
        <Text className="text-3xl font-extrabold text-white">Your Trails 🗺️</Text>
        
        <View className="flex-row gap-2">
          {snaps.length > 0 && (
            <TouchableOpacity 
              onPress={clearAllHistory}
              className="bg-red-950/40 border border-red-900/60 px-3 py-2 rounded-xl active:bg-red-900/40"
            >
              <Text className="text-red-400 font-medium text-xs">Clear All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl active:bg-slate-800"
          >
            <Text className="text-slate-300 font-medium text-xs">Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Snap List */}
      {snaps.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500 text-base text-center">
            No saved snaps yet. Go take one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex-row items-center shadow-md">
              <Image source={{ uri: item.uri }} className="w-20 h-20 rounded-xl bg-slate-800 mr-4" />
              
              <View className="flex-1">
                <Text className="text-emerald-400 font-semibold text-sm mb-1" numberOfLines={1}>
                  📍 {item.address || "Unknown Place"}
                </Text>
                <Text className="text-slate-500 font-mono text-xs mb-1">
                  {item.lat}, {item.lon}
                </Text>
                <Text className="text-slate-400 text-xs">Captured at {item.timestamp}</Text>
              </View>

              {/* Delete Button */}
              <TouchableOpacity 
                onPress={() => deleteSnap(item.id)}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700 active:bg-red-950"
              >
                <Text className="text-red-400 font-bold">🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}