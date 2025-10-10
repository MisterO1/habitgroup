import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { UserProvider, useUser } from "@/contexts/user-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuth, isLoading: isAuthLoading } = useAuth()
  const { userInfo, isLoading: isUserLoading } = useUser()

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!isAuth) {
    return (
      <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="auth" options={{ headerShown: false }}/>
      </Stack>
    )
  }

  if (isUserLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text>loading...</Text>
      </View>
    )
  }

  console.log("user connected", userInfo)
  
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="habit/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});