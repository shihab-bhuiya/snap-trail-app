/** @format */

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter(); // Initialize router for navigation

  const fetchLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        setLoading(false);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      setErrorMsg("Could not fetch location data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Function to handle moving to the camera screen
  const handleOpenCameraController = () => {
    if (!location) return;

    // We pass latitude and longitude as parameters in the "backpack"
    router.push({
      pathname: "/camera",
      params: {
        lat: location.coords.latitude.toString(),
        lon: location.coords.longitude.toString(),
      },
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1  bg-slate-950 items-center justify-center p-6">
        <Text className="text-4xl font-extrabold text-slate-900 mb-2">
          SnapTrail 📸
        </Text>
        <Text className="text-slate-400 text-center mb-8 text-base">
          Capture your adventures with live GPS tracking.
        </Text>

        {/* Location Status Card */}
        <View className="bg-slate-900 border border-slate-800 w-full p-5 rounded-2xl mb-6 shadow-md">
          <Text className="text-slate-200 font-semibold text-base mb-3">
            📍 Current GPS Location
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" className="py-4" />
          ) : errorMsg ? (
            <Text className="text-red-400 text-sm">{errorMsg}</Text>
          ) : location ? (
            <View>
              <Text className="text-slate-400 text-sm">
                Latitude:{" "}
                <Text className="text-white font-mono">
                  {location.coords.latitude.toFixed(4)}
                </Text>
              </Text>
              <Text className="text-slate-400 text-sm mt-1">
                Longitude:{" "}
                <Text className="text-white font-mono">
                  {location.coords.longitude.toFixed(4)}
                </Text>
              </Text>
            </View>
          ) : (
            <Text className="text-slate-400 text-sm">
              No location data found.
            </Text>
          )}

          <TouchableOpacity
            onPress={fetchLocation}
            className="mt-4 bg-slate-800 py-2.5 rounded-xl items-center active:bg-slate-700">
            <Text className="text-blue-400 font-medium text-sm">
              Refresh Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Camera Navigation Button */}
        <TouchableOpacity
          onPress={handleOpenCameraController}
          disabled={!location || loading}
          className={`w-full py-4 rounded-xl items-center shadow-lg ${
            !location
              ? "bg-slate-800 opacity-50"
              : "bg-blue-600 active:bg-blue-700"
          }`}>
          <Text className="text-white font-semibold text-lg">
            Open Camera & Snap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/history")}
          className="mt-4 bg-slate-900 border border-slate-800 w-full py-4 rounded-xl items-center active:bg-slate-800">
          <Text className="text-slate-300 font-semibold text-lg">
            View Saved Trails 🗺️
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
