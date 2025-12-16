import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-simple-toast";


import DailyMealCard, { MealItemData } from "../components/DailyMealCard";
import CustomBottomSheet, {
    CustomBottomSheetRef
} from "../components/CustomBottomSheet";
import RecipeSelectionSheetContent, {
    SimpleRecipe
} from "../components/RecipeSelectionSheetContent";


import { getAllUserRecipes } from "../services/recipe.service";
import {
    saveMealPlan,
    removeMealPlan,
    getWeeklyMealPlans
} from "../services/planner.service";


import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";
import { NavigationProps } from "../navigation/types";


const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
};

const formatDateDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return date.toLocaleDateString("id-ID", options);
};


interface DailyPlanUI {
    dateKey: string;
    dateDisplay: string;
    breakfast: MealItemData | null;
    lunch: MealItemData | null;
    dinner: MealItemData | null;
}

const PlannerScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const sheetRef = useRef<CustomBottomSheetRef>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(
        getMonday(new Date())
    );

    const [weeklyPlan, setWeeklyPlan] = useState<DailyPlanUI[]>([]);
    const [collectionRecipes, setCollectionRecipes] = useState<SimpleRecipe[]>(
        []
    );
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{
        dayIndex: number;
        dateKey: string;
        type: "breakfast" | "lunch" | "dinner";
    } | null>(null);

    

    const loadData = useCallback(async () => {
        try {
            const rawRecipes = await getAllUserRecipes();
            const formattedRecipes: SimpleRecipe[] = rawRecipes.map((r) => ({
                id: r.id,
                title: r.title,
                image: r.imageUrl || "https://via.placeholder.com/150",
                duration: `${r.duration} Min`,
                category: r.categories?.[0] ? `#${r.categories[0]}` : "#Umum",
                isBookmarked: false
            }));
            setCollectionRecipes(formattedRecipes);

       
            const daysSkeleton: DailyPlanUI[] = [];
            const start = new Date(currentWeekStart);

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                daysSkeleton.push({
                    dateKey: formatDateKey(d),
                    dateDisplay: formatDateDisplay(d),
                    breakfast: null,
                    lunch: null,
                    dinner: null
                });
            }

            const endDate = new Date(start);
            endDate.setDate(start.getDate() + 6);

            const firestoreData = await getWeeklyMealPlans(
                formatDateKey(start),
                formatDateKey(endDate)
            );

            const mergedData = daysSkeleton.map((day) => {
                const found = firestoreData.find((f) => f.date === day.dateKey);
                if (found) {
                    return {
                        ...day,
                        breakfast: found.breakfast || null,
                        lunch: found.lunch || null,
                        dinner: found.dinner || null
                    };
                }
                return day;
            });

            setWeeklyPlan(mergedData);
        } catch (error) {
            console.error("Error loading planner data:", error);
           
        } finally {
            setLoading(false);
        }
    }, [currentWeekStart])


    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadData();
        }, [loadData])
    );

  

    const handleNextWeek = () => {
        const next = new Date(currentWeekStart);
        next.setDate(next.getDate() + 7);
        setCurrentWeekStart(next);
    };

    const handlePrevWeek = () => {
        const prev = new Date(currentWeekStart);
        prev.setDate(prev.getDate() - 7);
        setCurrentWeekStart(prev);
    };

    const handleAddMeal = (
        dayIndex: number,
        dateKey: string,
        type: "breakfast" | "lunch" | "dinner"
    ) => {
        setSelectedSlot({ dayIndex, dateKey, type });
        sheetRef.current?.open();
    };

    const handleRemoveMeal = async (
        dayIndex: number,
        dateKey: string,
        type: "breakfast" | "lunch" | "dinner"
    ) => {
        const oldPlan = [...weeklyPlan];
        const newPlan = [...weeklyPlan];
        newPlan[dayIndex] = { ...newPlan[dayIndex], [type]: null };
        setWeeklyPlan(newPlan);

        try {
            await removeMealPlan(dateKey, type);
            Toast.show("Menu dihapus", Toast.SHORT);
        } catch (error) {
            setWeeklyPlan(oldPlan);
            Alert.alert("Error", "Gagal menghapus menu.");
        }
    };

    const handleSelectRecipe = async (recipe: SimpleRecipe) => {
        if (!selectedSlot) return;

        const { dayIndex, dateKey, type } = selectedSlot;

        const mealData: MealItemData = {
            id: recipe.id,
            title: recipe.title,
            imageUrl: recipe.image
        };

        const newPlan = [...weeklyPlan];
        newPlan[dayIndex] = { ...newPlan[dayIndex], [type]: mealData };
        setWeeklyPlan(newPlan);

        sheetRef.current?.close();

        try {
            await saveMealPlan(dateKey, type, {
                recipeId: recipe.id,
                title: recipe.title,
                imageUrl: recipe.image
            });
            Toast.show("Menu berhasil ditambahkan", Toast.SHORT);
        } catch (error) {
            loadData(); 
            Alert.alert("Error", "Gagal menyimpan menu ke server.");
        } finally {
            setSelectedSlot(null);
        }
    };

    const getWeekRangeDisplay = () => {
        const end = new Date(currentWeekStart);
        end.setDate(end.getDate() + 6);

        const startStr = currentWeekStart.getDate();
        const endStr = end.getDate();
        const monthStr = currentWeekStart.toLocaleDateString("id-ID", {
            month: "short"
        });

        const rangeText = `${startStr} - ${endStr} ${monthStr}`;

        const realCurrentMonday = getMonday(new Date());

        if (
            formatDateKey(currentWeekStart) === formatDateKey(realCurrentMonday)
        ) {
            return `Minggu ini (${rangeText})`;
        } else {
            return rangeText;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
           
                <View style={styles.weekNavigatorWrapper}>
                    <View style={styles.weekNavigator}>
                        <TouchableOpacity
                            onPress={handlePrevWeek}
                            style={styles.navArrow}
                        >
                            <MaterialIcons
                                name="chevron-left"
                                size={ms(24)}
                                color={COLORS.gray900}
                            />
                        </TouchableOpacity>

                        <Text style={styles.weekText}>
                            {getWeekRangeDisplay()}
                        </Text>

                        <TouchableOpacity
                            onPress={handleNextWeek}
                            style={styles.navArrow}
                        >
                            <MaterialIcons
                                name="chevron-right"
                                size={ms(24)}
                                color={COLORS.gray900}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

               
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primary}
                        />
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {weeklyPlan.map((day, index) => (
                            <DailyMealCard
                                key={day.dateKey}
                                date={day.dateDisplay}
                                breakfast={day.breakfast}
                                lunch={day.lunch}
                                dinner={day.dinner}
                                onRemove={(type) =>
                                    handleRemoveMeal(index, day.dateKey, type)
                                }
                                onAdd={(type) =>
                                    handleAddMeal(index, day.dateKey, type)
                                }
                                onPressMeal={(id) => {
                                

                                    navigation.navigate("RecipeDetail", {
                                        recipeId: id
                                    });
                                }}
                            />
                        ))}
                        <View style={{ height: vs(80) }} />
                    </ScrollView>
                )}

          
                <CustomBottomSheet
                    ref={sheetRef}
                    title="Pilih Resep Dari Koleksi"
                >
                    <RecipeSelectionSheetContent
                        recipes={collectionRecipes}
                        onSelect={handleSelectRecipe}
                        onClose={() => sheetRef.current?.close()}
                    />
                </CustomBottomSheet>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    weekNavigatorWrapper: {
        paddingHorizontal: hs(24),
        paddingVertical: vs(16),
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 10
    },
    weekNavigator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.gray100,
        borderRadius: ms(12),
        paddingVertical: vs(8),
        paddingHorizontal: hs(8)
    },
    navArrow: {
        padding: ms(4),
        justifyContent: "center",
        alignItems: "center"
    },
    weekText: {
        ...FONTS.bold,
        fontSize: ms(14),
        color: COLORS.black
    },
    scrollContent: {
        paddingHorizontal: hs(24),
        paddingTop: vs(24)
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default PlannerScreen;
