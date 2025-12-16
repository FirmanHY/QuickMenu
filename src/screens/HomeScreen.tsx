import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    FlatList,
    Pressable,
    Alert,
    RefreshControl
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import auth from "@react-native-firebase/auth";
import { getUserProfile, signOut } from "../services/auth.service";
import { getDailyPlan } from "../services/planner.service"; // Service baru
import {
    getHealthyRecipes,
    toggleBookmark,
    Recipe
} from "../services/recipe.service";

import CustomInput from "../components/CustomInput";
import DailyMenuCard from "../components/DailyMenuCard";
import RecipeCard from "../components/RecipeCard";
import CustomBottomSheet, {
    CustomBottomSheetRef
} from "../components/CustomBottomSheet";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";

const getTodayDateKey = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getDayName = () => {
    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];
    return days[new Date().getDay()];
};

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const bottomSheetRef = useRef<CustomBottomSheetRef>(null);

    const [greeting, setGreeting] = useState({
        text: "Selamat Pagi",
        icon: "wb-sunny"
    });
    const [userName, setUserName] = useState("Pengguna");

    const [todayMeals, setTodayMeals] = useState<{
        breakfast?: string;
        lunch?: string;
        dinner?: string;
    }>({});

    const [inspirationRecipes, setInspirationRecipes] = useState<Recipe[]>([]);
    const [loadingRecipes, setLoadingRecipes] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth().currentUser;
            if (currentUser) {
                try {
                    const userData: any = await getUserProfile(currentUser.uid);
                    if (userData && userData.fullName) {
                        setUserName(userData.fullName);
                    } else if (currentUser.displayName) {
                        setUserName(currentUser.displayName);
                    }
                } catch (error) {
                    console.error("Gagal load profile:", error);
                }
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) {
                setGreeting({ text: "Selamat Pagi", icon: "wb-sunny" });
            } else if (hour >= 11 && hour < 15) {
                setGreeting({ text: "Selamat Siang", icon: "wb-sunny" });
            } else if (hour >= 15 && hour < 18) {
                setGreeting({ text: "Selamat Sore", icon: "wb-cloudy" });
            } else {
                setGreeting({ text: "Selamat Malam", icon: "nights-stay" });
            }
        };
        updateGreeting();
    }, []);

    const fetchHomeData = async () => {
        try {
            const todayKey = getTodayDateKey();
            const plan = await getDailyPlan(todayKey);

            if (plan) {
                setTodayMeals({
                    breakfast: plan.breakfast?.title,
                    lunch: plan.lunch?.title,
                    dinner: plan.dinner?.title
                });
            } else {
                setTodayMeals({});
            }

            const recipes = await getHealthyRecipes();
            setInspirationRecipes(recipes);
        } catch (error) {
            console.error("Error fetching home data:", error);
        } finally {
            setLoadingRecipes(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHomeData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHomeData();
    };

    const handleSearchPress = () => navigation.navigate("Eksplor");
    const handleWeeklyPlanPress = () => navigation.navigate("Perencana");
    const handleSeeAllPress = () => navigation.navigate("Eksplor"); // Atau filter category 'Sehat'
    const handleMenuPress = () => bottomSheetRef.current?.open();

    const handleLogout = async () => {
        try {
            bottomSheetRef.current?.close();
            await signOut();
        } catch (error) {
            console.error("Gagal Logout:", error);
            Alert.alert("Error", "Gagal keluar akun, silakan coba lagi.");
        }
    };

    const handleBookmark = async (recipe: Recipe) => {
        const oldStatus = recipe.isBookmarked;
        const targetStatus = !oldStatus;
        setInspirationRecipes((prev) =>
            prev.map((r) =>
                r.id === recipe.id ? { ...r, isBookmarked: targetStatus } : r
            )
        );

        try {
            await toggleBookmark(recipe.id, targetStatus);
        } catch (error) {
            console.error("Gagal bookmark:", error);

            setInspirationRecipes((prev) =>
                prev.map((r) =>
                    r.id === recipe.id ? { ...r, isBookmarked: oldStatus } : r
                )
            );
            Alert.alert("Error", "Gagal mengubah bookmark");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <View style={styles.greetingContainer}>
                            <MaterialIcons
                                name={greeting.icon}
                                size={ms(20)}
                                color={
                                    greeting.icon === "nights-stay"
                                        ? COLORS.primary
                                        : "#FDB813"
                                }
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.greetingText}>
                                {greeting.text}
                            </Text>
                        </View>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={handleMenuPress}
                    >
                        <MaterialIcons
                            name="menu"
                            size={ms(28)}
                            color={COLORS.black}
                        />
                    </TouchableOpacity>
                </View>

                <Pressable
                    onPress={handleSearchPress}
                    style={{ marginTop: vs(24) }}
                >
                    <View pointerEvents="none">
                        <CustomInput
                            placeholder="Cari resep sehat..."
                            iconName="search"
                            editable={false}
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                </Pressable>

                <View style={styles.sectionContainer}>
                    <DailyMenuCard
                        dayName={getDayName()}
                        meals={todayMeals}
                        onPressWeeklyPlan={handleWeeklyPlanPress}
                    />
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Resep Sehat Pilihan
                        </Text>
                        <TouchableOpacity onPress={handleSeeAllPress}>
                            <Text style={styles.seeAllText}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={inspirationRecipes}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.recipeListContent}
                        renderItem={({ item }) => (
                            <RecipeCard
                                variant="large"
                                imageUrl={
                                    item.imageUrl ||
                                    "https://via.placeholder.com/300?text=No+Image"
                                }
                                title={item.title}
                                duration={`${item.duration} Min`}
                                category={
                                    item.categories?.[0]
                                        ? `#${item.categories[0]}`
                                        : "#Sehat"
                                }
                                showBookmark={true}
                                isBookmarked={item.isBookmarked}
                                onPress={() =>
                                    navigation.navigate("RecipeDetail", {
                                        recipeId: item.id
                                    })
                                }
                                onBookmarkPress={() => handleBookmark(item)}
                            />
                        )}
                        ListEmptyComponent={() =>
                            !loadingRecipes ? (
                                <Text style={styles.emptyText}>
                                    Belum ada resep sehat.
                                </Text>
                            ) : null
                        }
                        ItemSeparatorComponent={() => (
                            <View style={{ width: hs(16) }} />
                        )}
                    />
                </View>

                <View style={{ height: vs(100) }} />
            </ScrollView>
            <CustomBottomSheet ref={bottomSheetRef}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="logout"
                        size={ms(24)}
                        color={COLORS.black}
                        style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>Keluar</Text>
                </TouchableOpacity>
                <View style={{ height: vs(20) }} />
            </CustomBottomSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingHorizontal: hs(24), paddingTop: vs(20) },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    greetingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: vs(4)
    },
    greetingText: { ...FONTS.bold, fontSize: ms(16), color: COLORS.black },
    userName: {
        ...FONTS.bold,
        fontSize: ms(20),
        color: COLORS.black,
        textTransform: "capitalize"
    },
    menuButton: { padding: 4 },
    sectionContainer: { marginTop: vs(24) },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: vs(16)
    },
    sectionTitle: { ...FONTS.bold, fontSize: ms(18), color: COLORS.black },
    seeAllText: { ...FONTS.bold, fontSize: ms(12), color: COLORS.primary },
    recipeListContent: { paddingVertical: 4, paddingRight: hs(24) },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: vs(12)
    },
    menuIcon: { marginRight: ms(16) },
    menuText: { ...FONTS.bold, fontSize: ms(16), color: COLORS.black },
    emptyText: { ...FONTS.regular, color: COLORS.gray900, marginLeft: hs(4) }
});

export default HomeScreen;
