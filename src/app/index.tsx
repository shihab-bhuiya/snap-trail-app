import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Statistics State
  const [totalSnaps, setTotalSnaps] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);

  const router = useRouter();

  const fetchLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    setAddress(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        setLoading(false);
        return;
      }
      
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name || addr.street || ""}, ${addr.city || addr.subregion || ""}`.replace(/^,\s/, "");
        setAddress(formattedAddress || "Unknown Area");
      }
    } catch (error) {
      setErrorMsg("Could not fetch location data.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await AsyncStorage.getItem("@snap_trail_history");
      if (data) {
        const snaps = JSON.parse(data);
        setTotalSnaps(snaps.length);
        setTotalFavorites(snaps.filter((s: any) => s.isFavorite).length);
      } else {
        setTotalSnaps(0);
        setTotalFavorites(0);
      }
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  useEffect(() => {
    fetchLocation();
    loadStats();
  }, []);

  // Refresh stats whenever user navigates back to home screen
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const handleOpenCamera = () => {
    if (!location) return;
    router.push({
      pathname: "/camera",
      params: {
        lat: location.coords.latitude.toString(),
        lon: location.coords.longitude.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="mb-6 mt-2">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-extrabold text-white tracking-tight">SnapTrail 📸</Text>
            <View className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              <Text className="text-blue-400 text-xs font-semibold">v1.0 Pro</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-base">
            Capture your adventures with precision GPS tagging.
          </Text>
        </View>

        {/* Travel Stats Grid */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <Text className="text-slate-400 text-xs mb-1">Total Snaps</Text>
            <Text className="text-white text-2xl font-extrabold">{totalSnaps}</Text>
          </View>
          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <Text className="text-slate-400 text-xs mb-1">Favorites</Text>
            <Text className="text-rose-500 text-2xl font-extrabold">{totalFavorites} ❤️</Text>
          </View>
        </View>

        {/* Live GPS Status Card */}
        <View className="bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-6 shadow-xl">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-lg shadow-emerald-500/50" />
              <Text className="text-slate-200 font-bold text-base">Live Location</Text>
            </View>
            <TouchableOpacity 
              onPress={fetchLocation}
              className="bg-slate-800 px-3 py-1.5 rounded-xl active:bg-slate-700"
            >
              <Text className="text-blue-400 text-xs font-medium">Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-6 items-center justify-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-slate-500 text-xs mt-2">Acquiring satellite lock & address...</Text>
            </View>
          ) : errorMsg ? (
            <View className="py-4 bg-red-950/20 border border-red-900/40 rounded-2xl p-3">
              <Text className="text-red-400 text-sm text-center">{errorMsg}</Text>
            </View>
          ) : location ? (
            <View className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <Text className="text-emerald-400 font-semibold text-base mb-3" numberOfLines={2}>
                📍 {address || "Locating area..."}
              </Text>

              <View className="border-t border-slate-800/80 pt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-500 text-xs">Latitude</Text>
                  <Text className="text-slate-300 font-mono text-xs">{location.coords.latitude.toFixed(6)}° N</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-xs">Longitude</Text>
                  <Text className="text-slate-300 font-mono text-xs">{location.coords.longitude.toFixed(6)}° E</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text className="text-slate-500 text-sm py-4 text-center">No location acquired.</Text>
          )}
        </View>

        {/* Action Buttons Section */}
        <View className="gap-4">
          <TouchableOpacity 
            onPress={handleOpenCamera}
            disabled={!location || loading}
            className={`w-full py-5 rounded-2xl items-center shadow-2xl flex-row justify-center ${
              !location ? "bg-slate-800 opacity-50" : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            <Text className="text-white font-bold text-lg mr-2">📷</Text>
            <Text className="text-white font-bold text-lg">Open Camera & Snap</Text>
          </TouchableOpacity>

          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={() => router.push("/history")}
              className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl items-center active:bg-slate-800 shadow-md"
            >
              <Text className="text-xl mb-1">🗺️</Text>
              <Text className="text-slate-200 font-semibold text-sm">Your Trails</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push("/map")}
              className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl items-center active:bg-slate-800 shadow-md"
            >
              <Text className="text-xl mb-1">📍</Text>
              <Text className="text-slate-200 font-semibold text-sm">Journey Map</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}