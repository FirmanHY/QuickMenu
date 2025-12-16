import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native"; // Tambah useNavigation
import Toast from "react-native-simple-toast";

import CustomInput from "../components/CustomInput";
import Chip from "../components/Chip";
import QuickMenuRecipeCard from "../components/QuickMenuRecipeCard";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

import {
    getQuickMenuRecipes,
    toggleBookmark,
    Recipe
} from "../services/recipe.service";
import { getDefaultCategories, Category } from "../services/category.service";

import { NavigationProps } from "../navigation/types";

const ExploreScreen = () => {
    const navigation = useNavigation<NavigationProps>();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("semua");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([loadRecipes(), loadCategories()]);
        } catch (error) {
            console.error("Error loading data:", error);
            Toast.show("Gagal memuat data", Toast.SHORT);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRecipes = async () => {
        try {
            const quickMenuRecipes = await getQuickMenuRecipes();
            setRecipes(quickMenuRecipes);
            filterRecipes(searchQuery, activeFilter, quickMenuRecipes);
        } catch (error: any) {
            console.error("Error loading recipes:", error);
            throw error;
        }
    };

    const loadCategories = async () => {
        try {
            const defaultCategories = await getDefaultCategories();

            const categoriesWithAll = [
                {
                    id: "semua",
                    name: "All",
                    displayName: "Semua",
                    isDefault: true,
                    createdAt: 0
                } as Category,
                ...defaultCategories
            ];

            setCategories(categoriesWithAll);
        } catch (error) {
            console.error("Error loading categories:", error);
            setCategories([
                {
                    id: "semua",
                    name: "All",
                    displayName: "Semua",
                    isDefault: true,
                    createdAt: 0
                } as Category
            ]);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        filterRecipes(text, activeFilter, recipes);
    };

    const handleFilterChange = (filterId: string) => {
        setActiveFilter(filterId);
        filterRecipes(searchQuery, filterId, recipes);
    };

    const filterRecipes = (
        search: string,
        filter: string,
        allRecipes: Recipe[]
    ) => {
        let filtered = [...allRecipes];

        if (search.trim() !== "") {
            filtered = filtered.filter((recipe) =>
                recipe.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filter !== "semua") {
            filtered = filtered.filter((recipe) =>
                recipe.categories?.includes(filter)
            );
        }

        setFilteredRecipes(filtered);
    };

    const handleBookmarkToggle = async (
        recipeId: string,
        isBookmarked: boolean
    ) => {
        try {
            await toggleBookmark(recipeId, isBookmarked);

            setRecipes((prev) =>
                prev.map((recipe) =>
                    recipe.id === recipeId
                        ? { ...recipe, isBookmarked: !isBookmarked }
                        : recipe
                )
            );

            setFilteredRecipes((prev) =>
                prev.map((recipe) =>
                    recipe.id === recipeId
                        ? { ...recipe, isBookmarked: !isBookmarked }
                        : recipe
                )
            );

            Toast.show(
                isBookmarked
                    ? "Dihapus dari koleksi"
                    : "Ditambahkan ke koleksi",
                Toast.SHORT
            );
        } catch (error: any) {
            console.error("Error toggling bookmark:", error);
            Alert.alert("Error", error.message || "Gagal mengubah bookmark");
        }
    };

    const handleRecipePress = (recipe: Recipe) => {
        navigation.navigate("RecipeDetail", {
            recipeId: recipe.id
        });
    };

    const renderEmptyComponent = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada resep ditemukan</Text>
                <Text style={styles.emptySubtext}>
                    {searchQuery
                        ? "Coba kata kunci lain"
                        : activeFilter !== "semua"
                        ? `Tidak ada resep dengan kategori "${
                              categories.find((c) => c.id === activeFilter)
                                  ?.displayName || activeFilter
                          }"`
                        : "Belum ada resep QuickMenu"}
                </Text>
            </View>
        );
    };

    const renderRecipeCard = ({ item }: { item: Recipe }) => (
        <QuickMenuRecipeCard
            title={item.title}
            image={item.imageUrl || ""}
            duration={`${item.duration} Min`}
            category={
                item.categories && item.categories.length > 0
                    ? `#${item.categories[0]}`
                    : "#Lainnya"
            }
            isBookmarked={item.isBookmarked}
            onPress={() => handleRecipePress(item)}
            onBookmarkPress={() =>
                handleBookmarkToggle(item.id, item.isBookmarked || false)
            }
        />
    );

    const getActiveFilterName = () => {
        const category = categories.find((c) => c.id === activeFilter);
        return category?.displayName || "Semua";
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Memuat resep...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.fixedHeader}>
                <CustomInput
                    placeholder="Cari resep di database QuickMenu"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    iconName="search"
                    containerStyle={styles.searchBar}
                />
                <Text style={styles.sectionTitle}>Filter Pencarian</Text>
                <View style={styles.filterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContentContainer}
                        style={styles.filterScrollView}
                    >
                        {categories.map((category) => (
                            <Chip
                                key={category.id}
                                label={category.displayName}
                                isActive={activeFilter === category.id}
                                onPress={() => handleFilterChange(category.id)}
                                style={styles.chipSpacing}
                            />
                        ))}
                    </ScrollView>
                </View>

                <Text style={styles.sectionTitle}>
                    {searchQuery
                        ? `Hasil pencarian "${searchQuery}"`
                        : `Resep ${getActiveFilterName()}`}{" "}
                    ({filteredRecipes.length})
                </Text>
            </View>

            <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyComponent}
                renderItem={renderRecipeCard}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        marginTop: vs(12)
    },
    fixedHeader: {
        paddingHorizontal: hs(24),
        paddingTop: vs(8),
        paddingBottom: vs(8),
        backgroundColor: COLORS.white
    },
    searchBar: {
        marginBottom: vs(24)
    },
    sectionTitle: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.black,
        marginBottom: vs(16)
    },
    filterContainer: {
        marginBottom: vs(24)
    },
    filterScrollView: {
        marginHorizontal: -hs(24),
        flexGrow: 0
    },
    filterContentContainer: {
        paddingHorizontal: hs(24)
    },
    chipSpacing: {
        marginRight: hs(12),
        marginBottom: 0
    },
    listContent: {
        paddingHorizontal: hs(24),
        paddingTop: vs(8),
        paddingBottom: vs(100)
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: vs(60),
        paddingHorizontal: hs(40)
    },
    emptyText: {
        ...FONTS.bold,
        fontSize: ms(18),
        color: COLORS.black,
        marginBottom: vs(8),
        textAlign: "center"
    },
    emptySubtext: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        textAlign: "center",
        lineHeight: ms(20)
    }
});

export default ExploreScreen;
