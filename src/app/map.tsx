import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const router = useRouter();

  // Default region (fallback if no snaps exist yet)
  const [region, setRegion] = useState({
    latitude: 23.8103,
    longitude: 90.4125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const data = await AsyncStorage.getItem("@snap_trail_history");
      if (data) {
        const parsedSnaps = JSON.parse(data);
        setSnaps(parsedSnaps);

        // If we have snaps, center the map on the most recent snap!
        if (parsedSnaps.length > 0) {
          setRegion({
            latitude: Number(parsedSnaps[0].lat),
            longitude: Number(parsedSnaps[0].lon),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load map history", error);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Native Map Component */}
      <MapView style={{ flex: 1 }} region={region}>
        {snaps.map((snap) => (
          <Marker
            key={snap.id}
            coordinate={{
              latitude: Number(snap.lat),
              longitude: Number(snap.lon),
            }}
            title={`Snap at ${snap.timestamp}`}
            description={`Lat: ${snap.lat}, Lon: ${snap.lon}`}
          >
            {/* Custom Marker Callout Bubble / Thumbnail preview */}
            <View className="bg-slate-900 border-2 border-blue-500 rounded-xl p-1 shadow-lg">
              <Image source={{ uri: snap.uri }} className="w-12 h-12 rounded-lg" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Header / Back Button Overlay */}
      <View className="absolute top-12 left-6 right-6 flex-row justify-between items-center">
        <View className="bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/50 shadow-lg">
          <Text className="text-white font-bold text-base">Journey Map 🗺️</Text>
          <Text className="text-slate-400 text-xs">{snaps.length} locations pinned</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/50 shadow-lg active:bg-slate-800"
        >
          <Text className="text-white font-medium">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}