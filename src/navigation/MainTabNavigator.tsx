import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs } from "../utils/responsive";
import HomeScreen from "../screens/HomeScreen";

const CollectionScreen = () => (
    <View style={styles.center}>
        <Text>Halaman Koleksi</Text>
    </View>
);
const ExploreScreen = () => (
    <View style={styles.center}>
        <Text>Halaman Eksplor</Text>
    </View>
);
const PlannerScreen = () => (
    <View style={styles.center}>
        <Text>Halaman Perencana</Text>
    </View>
);

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray900,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    height: vs(70),
                    paddingBottom: vs(12),
                    paddingTop: vs(12),
                    borderTopLeftRadius: ms(24),
                    borderTopRightRadius: ms(24),
                    borderTopWidth: 0,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4
                },

                tabBarLabel: ({ focused, color }) => (
                    <Text
                        style={{
                            color: color,
                            fontSize: ms(10),
                            marginTop: vs(4),
                            ...(focused ? FONTS.semiBold : FONTS.regular)
                        }}
                    >
                        {route.name}
                    </Text>
                ),

                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = "home";

                    if (route.name === "Beranda") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Koleksi") {
                        iconName = focused ? "folder-open" : "folder";
                    } else if (route.name === "Eksplor") {
                        iconName = "magnify";
                    } else if (route.name === "Perencana") {
                        iconName = focused
                            ? "calendar-month"
                            : "calendar-blank-outline";
                    }
                    return <Icon name={iconName} size={ms(26)} color={color} />;
                }
            })}
        >
            <Tab.Screen name="Beranda" component={HomeScreen} />
            <Tab.Screen name="Koleksi" component={CollectionScreen} />
            <Tab.Screen name="Eksplor" component={ExploreScreen} />
            <Tab.Screen name="Perencana" component={PlannerScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.white
    }
});

export default MainTabNavigator;
