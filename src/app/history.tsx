import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["All", "🏙️ City", "🌲 Nature", "🍔 Food", "🧭 Landmark"];

export default function HistoryScreen() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
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

  const toggleFavorite = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      const updatedSnaps = snaps.map((snap) => {
        if (snap.id === id) {
          return { ...snap, isFavorite: !snap.isFavorite };
        }
        return snap;
      });
      setSnaps(updatedSnaps);
      await AsyncStorage.setItem("@snap_trail_history", JSON.stringify(updatedSnaps));
    } catch (error) {
      console.error("Failed to update favorite status", error);
    }
  };

  const deleteSnap = async (id: string) => {
    try {
      const updatedSnaps = snaps.filter((snap) => snap.id !== id);
      setSnaps(updatedSnaps);
      await AsyncStorage.setItem("@snap_trail_history", JSON.stringify(updatedSnaps));
    } catch (error) {
      console.error("Failed to delete snap", error);
    }
  };

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

  // Filter snaps based on search query, category, and favorite filter
  const filteredSnaps = snaps.filter((snap) => {
    const matchesSearch = (snap.address || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || snap.category === selectedCategory;
    const matchesFavorite = onlyFavorites ? snap.isFavorite === true : true;
    return matchesSearch && matchesCategory && matchesFavorite;
  });

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

      {/* Search Bar & Filters */}
      {snaps.length > 0 && (
        <View className="mb-4 gap-3">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location or address..."
            placeholderTextColor="#64748b"
            className="bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm"
          />

          {/* Category Filter Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedCategory === cat 
                    ? "bg-blue-600 border-blue-500" 
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <Text className={`text-xs font-semibold ${selectedCategory === cat ? "text-white" : "text-slate-400"}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Favorites Filter Toggle */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setOnlyFavorites(false)}
              className={`px-4 py-2 rounded-xl border ${
                !onlyFavorites ? "bg-blue-600 border-blue-500" : "bg-slate-900 border-slate-800"
              }`}
            >
              <Text className={`text-xs font-semibold ${!onlyFavorites ? "text-white" : "text-slate-400"}`}>
                All Trails ({snaps.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOnlyFavorites(true)}
              className={`px-4 py-2 rounded-xl border flex-row items-center gap-1 ${
                onlyFavorites ? "bg-rose-600 border-rose-500" : "bg-slate-900 border-slate-800"
              }`}
            >
              <Text className="text-xs">❤️</Text>
              <Text className={`text-xs font-semibold ${onlyFavorites ? "text-white" : "text-slate-400"}`}>
                Favorites ({snaps.filter(s => s.isFavorite).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Snap List */}
      {snaps.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500 text-base text-center">
            No saved snaps yet. Go take one!
          </Text>
        </View>
      ) : filteredSnaps.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500 text-base text-center">
            No matching snaps found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSnaps}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/detail",
                  params: {
                    id: item.id,
                    uri: item.uri,
                    address: item.address,
                    lat: item.lat,
                    lon: item.lon,
                    timestamp: item.timestamp,
                    isFavorite: item.isFavorite ? "true" : "false",
                  },
                })
              }
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex-row items-center shadow-md active:bg-slate-800/80"
            >
              <Image source={{ uri: item.uri }} className="w-20 h-20 rounded-xl bg-slate-800 mr-4" />
              
              <View className="flex-1">
                <Text className="text-emerald-400 font-semibold text-sm mb-1" numberOfLines={1}>
                  📍 {item.address || "Unknown Place"}
                </Text>
                {item.category && (
                  <View className="self-start bg-slate-800/80 px-2 py-0.5 rounded-md mb-1 border border-slate-700/60">
                    <Text className="text-blue-400 text-[10px] font-semibold">{item.category}</Text>
                  </View>
                )}
                <Text className="text-slate-500 font-mono text-xs mb-1">
                  {item.lat}, {item.lon}
                </Text>
                <Text className="text-slate-400 text-xs">Captured at {item.timestamp}</Text>
              </View>

              {/* Favorite Heart Button */}
              <TouchableOpacity 
                onPress={(e) => toggleFavorite(item.id, e)}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700 active:bg-slate-700 ml-2"
              >
                <Text className="text-base">{item.isFavorite ? "❤️" : "🤍"}</Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  deleteSnap(item.id);
                }}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700 active:bg-red-950 ml-2"
              >
                <Text className="text-red-400 font-bold">🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}