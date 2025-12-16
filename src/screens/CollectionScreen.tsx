import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-simple-toast";
import RecipeCard from "../components/RecipeCard";
import Chip from "../components/Chip";
import CustomInput from "../components/CustomInput";
import FloatingButton from "../components/FloatingButton";
import CustomBottomSheet, {
    CustomBottomSheetRef
} from "../components/CustomBottomSheet";
import AddRecipeContent from "../components/AddRecipeContent";
import LinkImportBottomSheet from "../components/LinkImportBottomSheet"; // Import Baru

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { hs, vs, ms } from "../utils/responsive";

import { getAllUserRecipes, Recipe } from "../services/recipe.service";
import { getAllCategories, Category } from "../services/category.service";
import { NavigationProps } from "../navigation/types";

const CollectionScreen = () => {
    const navigation = useNavigation<NavigationProps>();

    const addRecipeSheetRef = useRef<CustomBottomSheetRef>(null);
    const linkImportSheetRef = useRef<CustomBottomSheetRef>(null);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("semua");
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
            const allRecipes = await getAllUserRecipes();
            setRecipes(allRecipes);
            filterRecipes(searchQuery, selectedCategory, allRecipes);
        } catch (error: any) {
            console.error("Error loading recipes:", error);
            throw error;
        }
    };

    const loadCategories = async () => {
        try {
            const allCategories = await getAllCategories();
            const categoriesWithAll = [
                {
                    id: "semua",
                    name: "All",
                    displayName: "Semua",
                    isDefault: true,
                    createdAt: 0
                } as Category,
                ...allCategories
            ];
            setCategories(categoriesWithAll);
        } catch (error) {
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
        filterRecipes(text, selectedCategory, recipes);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        filterRecipes(searchQuery, categoryId, recipes);
    };

    const filterRecipes = (
        search: string,
        category: string,
        allRecipes: Recipe[]
    ) => {
        let filtered = [...allRecipes];
        if (search.trim() !== "") {
            filtered = filtered.filter((recipe) =>
                recipe.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (category !== "semua") {
            filtered = filtered.filter((recipe) =>
                recipe.categories?.includes(category)
            );
        }
        setFilteredRecipes(filtered);
    };

    const handleRecipePress = (recipe: Recipe) => {
        navigation.navigate("RecipeDetail", { recipeId: recipe.id });
    };

    const handleFloatingButtonPress = () => {
        addRecipeSheetRef.current?.open();
    };

    const handleImportFromLink = () => {
        addRecipeSheetRef.current?.close();
        setTimeout(() => {
            linkImportSheetRef.current?.open();
        }, 300);
    };

    const handleLinkSubmit = async (url: string) => {
        linkImportSheetRef.current?.close();

        setTimeout(() => {
            navigation.navigate("ImportPreview", { url });
        }, 300);
    };
    const handleAddManual = () => {
        addRecipeSheetRef.current?.close();
        setTimeout(() => {
            navigation.navigate("AddRecipeManual" as never);
        }, 300);
    };

    const handleCancelSheet = () => {
        addRecipeSheetRef.current?.close();
    };

    const getActiveFilterName = () => {
        const category = categories.find((c) => c.id === selectedCategory);
        return category?.displayName || "Semua";
    };

    const renderEmptyComponent = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {searchQuery || selectedCategory !== "semua"
                        ? "Tidak ada resep ditemukan"
                        : "Belum ada resep"}
                </Text>
                <Text style={styles.emptySubtext}>
                    {searchQuery
                        ? "Coba kata kunci lain"
                        : selectedCategory !== "semua"
                        ? "Tidak ada resep di kategori ini"
                        : "Tambah resep baru atau bookmark resep dari QuickMenu"}
                </Text>
            </View>
        );
    };

    const renderRecipeCard = ({ item }: { item: Recipe }) => {
        return (
            <RecipeCard
                variant="small"
                imageUrl={item.imageUrl}
                title={item.title}
                duration={item.duration}
                category={
                    item.categories && item.categories.length > 0
                        ? `#${item.categories[0]}`
                        : undefined
                }
                source={item.source}
                onPress={() => handleRecipePress(item)}
            />
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor={COLORS.white}
                />
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
                    placeholder="Cari resep di koleksi saya"
                    iconName="search"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    containerStyle={styles.searchInput}
                />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContainer}
                    style={styles.chipsScrollView}
                >
                    {categories.map((category) => (
                        <Chip
                            key={category.id}
                            label={category.displayName}
                            isActive={selectedCategory === category.id}
                            onPress={() => handleCategoryChange(category.id)}
                            style={styles.chip}
                        />
                    ))}
                </ScrollView>

                <Text style={styles.resultHeaderText}>
                    {searchQuery
                        ? `Hasil pencarian "${searchQuery}"`
                        : `Resep ${getActiveFilterName()}`}{" "}
                    ({filteredRecipes.length})
                </Text>
            </View>
            <FlatList
                data={filteredRecipes}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
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
            <FloatingButton onPress={handleFloatingButtonPress} />
            <CustomBottomSheet ref={addRecipeSheetRef} title="Tambah Resep">
                <AddRecipeContent
                    onImportFromLink={handleImportFromLink}
                    onAddManual={handleAddManual}
                    onCancel={handleCancelSheet}
                />
            </CustomBottomSheet>
            <LinkImportBottomSheet
                ref={linkImportSheetRef}
                onSubmit={handleLinkSubmit}
                onClose={() => linkImportSheetRef.current?.close()}
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
    searchInput: {
        marginBottom: vs(24)
    },
    chipsScrollView: {
        marginHorizontal: -hs(24),
        flexGrow: 0
    },
    chipsContainer: {
        paddingHorizontal: hs(24),
        marginBottom: vs(24)
    },
    chip: {
        marginRight: hs(8)
    },
    resultHeaderText: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.black
    },
    listContent: {
        paddingHorizontal: hs(24),
        paddingBottom: vs(100)
    },
    columnWrapper: {
        justifyContent: "space-between",
        marginBottom: vs(16)
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
    },
    fixedHeader: {
        paddingHorizontal: hs(24),
        paddingTop: vs(8),
        paddingBottom: vs(8),
        backgroundColor: COLORS.white
    }
});

export default CollectionScreen;
