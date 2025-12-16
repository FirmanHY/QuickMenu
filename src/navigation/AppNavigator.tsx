import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { RootStackParamList } from "./types";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms } from "../utils/responsive";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";
import AddRecipeManualScreen from "../screens/AddRecipeManualScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import EditRecipeScreen from "../screens/EditRecipeScreen";
import ImportPreviewScreen from "../screens/ImportPreviewScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const SplashScreen = () => (
    <View
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.white
        }}
    >
        <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
);

const AppNavigator = () => {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

    useEffect(() => {
        const authInstance = auth();
        const subscriber = authInstance.onAuthStateChanged((user) => {
            setUser(user);
            if (initializing) setInitializing(false);
        });

        return subscriber;
    }, []);

    if (initializing) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.white },
                    animation: "slide_from_right"
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen
                            name="MainApp"
                            component={MainTabNavigator}
                        />

                        <Stack.Screen
                            name="RecipeDetail"
                            component={RecipeDetailScreen}
                        />
                        <Stack.Screen
                            name="EditRecipe"
                            component={EditRecipeScreen}
                        />
                        <Stack.Screen
                            name="ImportPreview"
                            component={ImportPreviewScreen}
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="AddRecipeManual"
                            component={AddRecipeManualScreen}
                            options={{
                                headerShown: true,
                                title: "Tulis Resep",
                                headerStyle: {
                                    backgroundColor: COLORS.white
                                },
                                headerShadowVisible: false,
                                headerTitleStyle: {
                                    ...FONTS.bold,
                                    fontSize: ms(18),
                                    color: COLORS.black
                                },
                                headerTitleAlign: "center",
                                headerTintColor: COLORS.black,
                                contentStyle: {
                                    borderTopColor: COLORS.gray100,
                                    borderTopWidth: 1
                                }
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
