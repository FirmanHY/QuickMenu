import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    useWindowDimensions
} from "react-native";
import {
    useNavigation,
    useRoute,
    RouteProp,
    useIsFocused
} from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    SafeAreaView,
    useSafeAreaInsets
} from "react-native-safe-area-context";
import Toast from "react-native-simple-toast";
import RenderHtml from "react-native-render-html";


import TabSwitcher from "../components/TabSwitcher";
import CustomButton from "../components/CustomButton";
import Chip from "../components/Chip";
import CustomBottomSheet, {
    CustomBottomSheetRef
} from "../components/CustomBottomSheet";
import EditTagSheetContent from "../components/EditTagSheetContent";
import ScheduleRecipeSheetContent from "../components/ScheduleRecipeSheetContent"; // [NEW]


import {
    getRecipeById,
    toggleBookmark,
    updateUserRecipe,
    Recipe
} from "../services/recipe.service";
import {
    createUserCategory,
    getUserCategories
} from "../services/category.service";
import { saveMealPlan } from "../services/planner.service"; // [NEW]

import { RootStackParamList, NavigationProps } from "../navigation/types";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";


const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ingat, bulan mulai dari 0
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const getTagColor = (category: string) => {
    const colors = [
        { bg: "#E3F2FD", text: "#1565C0" },
        { bg: "#E8F5E9", text: "#2E7D32" },
        { bg: "#FFF3E0", text: "#EF6C00" },
        { bg: "#F3E5F5", text: "#7B1FA2" },
        { bg: "#F5F5F5", text: "#616161" }
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

type RecipeDetailRouteProp = RouteProp<RootStackParamList, "RecipeDetail">;

const RecipeDetailScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute<RecipeDetailRouteProp>();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { recipeId } = route.params;

    const editTagSheetRef = useRef<CustomBottomSheetRef>(null);
    const scheduleSheetRef = useRef<CustomBottomSheetRef>(null); // [NEW]

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Bahan-Bahan");
    const [isBookmarked, setIsBookmarked] = useState(false);


    const tagsStyles = useMemo(
        () => ({
            body: {
                color: COLORS.black,
                ...FONTS.regular,
                fontSize: ms(14),
                lineHeight: ms(24)
            },
            p: { marginBottom: 10, padding: 0, margin: 0 },
            li: { marginBottom: 6 },
            ul: { marginTop: 0, marginBottom: 10, paddingLeft: 20 },
            ol: { marginTop: 0, marginBottom: 10, paddingLeft: 20 },
            b: { ...FONTS.bold },
            strong: { ...FONTS.bold }
        }),
        []
    );

    useEffect(() => {
        if (isFocused) {
            loadRecipeData();
        }
    }, [recipeId, isFocused]);

    const loadRecipeData = async () => {
        try {
            if (!recipe) setIsLoading(true);
            const data = await getRecipeById(recipeId);
            if (data) {
                setRecipe(data);
                setIsBookmarked(!!data.isBookmarked);
            } else {
                Alert.alert("Error", "Resep tidak ditemukan", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memuat resep");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBookmark = async () => {
        if (!recipe) return;
        try {
            const newStatus = !isBookmarked;
            setIsBookmarked(newStatus);
            await toggleBookmark(recipe.id, !newStatus);
            if (newStatus) {
                Toast.show("Disimpan ke Koleksi", Toast.SHORT);
            } else {
                Toast.show("Dihapus dari Koleksi", Toast.SHORT);
            }
        } catch (error) {
            console.error("Bookmark error", error);
            setIsBookmarked(!isBookmarked);
        }
    };

    const handleEditRecipe = () => {
        if (recipe) {
            navigation.navigate("EditRecipe", { recipeId: recipe.id });
        }
    };

 
    const handleOpenTagModal = () => {
        editTagSheetRef.current?.open();
    };

    const handleSaveTags = async (newTags: string[]) => {
        if (!recipe) return;
        try {
            const existingCategories = await getUserCategories();
            const finalTags = await Promise.all(
                newTags.map(async (tagText) => {
                    const cleanTag = tagText.trim();
                    const generatedId = cleanTag
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                    const exists = existingCategories.some(
                        (c) => c.id === generatedId
                    );

                    if (!exists) {
                        try {
                            await createUserCategory(cleanTag, cleanTag);
                        } catch (err) {
                            console.warn(
                                `Gagal buat kategori: ${cleanTag}`,
                                err
                            );
                        }
                    }
                    return cleanTag;
                })
            );

            await updateUserRecipe(recipe.id, {
                ...recipe,
                categories: finalTags
            });
            setRecipe({ ...recipe, categories: finalTags });

            Toast.show("Tag berhasil diperbarui", Toast.SHORT);
            editTagSheetRef.current?.close();
        } catch (error) {
            console.error("Error saving tags:", error);
            Alert.alert("Error", "Gagal menyimpan perubahan tag.");
        }
    };

  
    const handleOpenSchedule = () => {
        scheduleSheetRef.current?.open();
    };

    const handleSaveSchedule = async (
        date: Date,
        type: "breakfast" | "lunch" | "dinner"
    ) => {
        if (!recipe) return;

        try {
            const dateKey = formatDateKey(date);

            await saveMealPlan(dateKey, type, {
                recipeId: recipe.id,
                title: recipe.title,
                imageUrl: recipe.imageUrl
            });

            Toast.show("Jadwal berhasil disimpan", Toast.SHORT);
            
        } catch (error) {
            console.error("Failed to save schedule:", error);
            Alert.alert("Error", "Gagal menyimpan jadwal.");
        }
    };

    const getActionButtonConfig = () => {
        if (!recipe) return { text: "Loading...", onPress: () => {} };

        console.log(recipe.source, isBookmarked);
        if (recipe.source === "QuickMenu" && !isBookmarked) {
            return {
                text: "Tambahkan ke Koleksi",
                onPress: handleToggleBookmark,
                style: { backgroundColor: COLORS.primary }
            };
        }


        return {
            text: "Tambahkan ke Rencana Menu",
            onPress: handleOpenSchedule, 
            style: { backgroundColor: COLORS.primary }
        };
    };

    const actionButtonConfig = getActionButtonConfig();

    const renderContent = () => {
        const htmlContent =
            activeTab === "Bahan-Bahan" ? recipe?.ingredients : recipe?.steps;

        if (!htmlContent) {
            return (
                <View style={styles.listContainer}>
                    <Text style={styles.emptyText}>Tidak ada data.</Text>
                </View>
            );
        }

        return (
            <View style={styles.htmlContainer}>
                <RenderHtml
                    contentWidth={width - hs(48)}
                    source={{ html: htmlContent }}
                    tagsStyles={tagsStyles}
                    systemFonts={[
                        FONTS.regular.fontFamily,
                        FONTS.bold.fontFamily
                    ]}
                />
            </View>
        );
    };

    if (isLoading && !recipe) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!recipe) return null;

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: vs(120) }}
                bounces={false}
            >
                <ImageBackground
                    source={{
                        uri:
                            recipe.imageUrl ||
                            "https://via.placeholder.com/500x500.png?text=No+Image"
                    }}
                    style={styles.imageBackground}
                >
                    <View style={styles.overlay} />
                    <SafeAreaView style={styles.headerButtons} edges={["top"]}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons
                                name="arrow-back"
                                size={ms(24)}
                                color={COLORS.black}
                            />
                        </TouchableOpacity>

                        {recipe.source === "QuickMenu" ? (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={handleToggleBookmark}
                            >
                                <MaterialIcons
                                    name={
                                        isBookmarked
                                            ? "bookmark"
                                            : "bookmark-border"
                                    }
                                    size={ms(24)}
                                    color={
                                        isBookmarked
                                            ? COLORS.primary
                                            : COLORS.black
                                    }
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={handleEditRecipe}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={ms(20)}
                                    color={COLORS.black}
                                />
                            </TouchableOpacity>
                        )}
                    </SafeAreaView>
                </ImageBackground>

                <View style={styles.contentSheet}>
                    <View style={styles.dragHandle} />

                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{recipe.title}</Text>
                        <View style={styles.durationWrapper}>
                            <MaterialIcons
                                name="access-time"
                                size={ms(16)}
                                color={COLORS.gray900}
                            />
                            <Text style={styles.durationText}>
                                {recipe.duration} Min
                            </Text>
                        </View>
                    </View>

                    {/* --- TAGS SECTION --- */}
                    <View style={styles.tagsRow}>
                        {recipe.categories && recipe.categories.length > 0
                            ? recipe.categories.map((cat, index) => {
                                  const colors = getTagColor(cat);
                                  return (
                                      <Chip
                                          key={index}
                                          label={`#${cat}`}
                                          backgroundColor={colors.bg}
                                          textColor={colors.text}
                                          style={{
                                              marginRight: hs(8),
                                              marginBottom: vs(8)
                                          }}
                                      />
                                  );
                              })
                            : null}

                        {recipe.source !== "QuickMenu" && (
                            <TouchableOpacity
                                onPress={handleOpenTagModal}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.editTagText}>
                                    {recipe.categories &&
                                    recipe.categories.length > 0
                                        ? "(Edit Tag)"
                                        : "(+ Tambah Tag)"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.tabWrapper}>
                        <TabSwitcher
                            tabs={["Bahan-Bahan", "Langkah-Langkah"]}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </View>

                    {renderContent()}
                </View>
            </ScrollView>

            <View
                style={[
                    styles.footerContainer,
                    {
                        paddingBottom:
                            insets.bottom > 0 ? insets.bottom : vs(16)
                    }
                ]}
            >
                <CustomButton
                    title={actionButtonConfig.text}
                    onPress={actionButtonConfig.onPress}
                    style={{
                        ...styles.actionButton,
                        ...actionButtonConfig.style
                    }}
                />
            </View>

        
            <CustomBottomSheet ref={editTagSheetRef} title="Edit Tag">
                <EditTagSheetContent
                    initialTags={recipe.categories || []}
                    onSave={handleSaveTags}
                />
            </CustomBottomSheet>

    
            <CustomBottomSheet ref={scheduleSheetRef} title="">
                <ScheduleRecipeSheetContent
                    onClose={() => scheduleSheetRef.current?.close()}
                    onSave={handleSaveSchedule}
                />
            </CustomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    center: { justifyContent: "center", alignItems: "center" },
    imageBackground: {
        width: "100%",
        height: vs(320),
        justifyContent: "flex-start"
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.1)"
    },
    headerButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: hs(24),
        marginTop: vs(10)
    },
    iconButton: {
        width: ms(40),
        height: ms(40),
        backgroundColor: COLORS.white,
        borderRadius: ms(12),
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    contentSheet: {
        flex: 1,
        backgroundColor: COLORS.white,
        marginTop: -vs(40),
        borderTopLeftRadius: ms(32),
        borderTopRightRadius: ms(32),
        paddingHorizontal: hs(24),
        paddingTop: vs(12)
    },
    dragHandle: {
        width: ms(40),
        height: vs(4),
        backgroundColor: COLORS.gray200,
        borderRadius: ms(2),
        alignSelf: "center",
        marginBottom: vs(20)
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: vs(12)
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(22),
        color: COLORS.black,
        flex: 1,
        marginRight: hs(12)
    },
    durationWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: vs(6)
    },
    durationText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.gray900,
        marginLeft: hs(4)
    },
    tagsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: vs(24),
        flexWrap: "wrap",
        gap: hs(8)
    },
    editTagText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.primary,
        marginLeft: hs(4),
        paddingVertical: 6
    },
    tabWrapper: { marginBottom: vs(24) },
    htmlContainer: {
        marginBottom: vs(32),
        minHeight: vs(100)
    },
    listContainer: {
        marginBottom: vs(32),
        minHeight: vs(100)
    },
    emptyText: {
        ...FONTS.regular,
        color: COLORS.gray900,
        textAlign: "center",
        marginTop: vs(10)
    },
    actionButton: { borderRadius: ms(12) },
    footerContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: hs(24),
        paddingTop: vs(16),
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 10
    }
});

export default RecipeDetailScreen;
