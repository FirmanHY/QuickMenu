import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Keyboard
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import QuickMenuRecipeCard from "./QuickMenuRecipeCard"; // Card yang kamu berikan
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";

export interface SimpleRecipe {
    id: string;
    title: string;
    image: string;
    duration: string;
    category: string;
    isBookmarked?: boolean;
}

interface RecipeSelectionSheetContentProps {
    recipes: SimpleRecipe[];
    onSelect: (recipe: SimpleRecipe) => void;
    onClose: () => void;
}

const RecipeSelectionSheetContent: React.FC<
    RecipeSelectionSheetContentProps
> = ({ recipes, onSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRecipes = useMemo(() => {
        if (!searchQuery) return recipes;
        return recipes.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, recipes]);

    const renderItem = ({ item }: { item: SimpleRecipe }) => (
        <QuickMenuRecipeCard
            title={item.title}
            image={item.image}
            duration={item.duration}
            category={item.category}
            isBookmarked={item.isBookmarked}
            onPress={() => {
                Keyboard.dismiss();
                onSelect(item);
            }}
            style={styles.cardItem}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <MaterialIcons
                    name="search"
                    size={ms(24)}
                    color={COLORS.primary}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari di koleksi"
                    placeholderTextColor={COLORS.gray900}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredRecipes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Resep tidak ditemukan</Text>
                }
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: vs(24)
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.gray200,
        borderRadius: ms(8),
        paddingHorizontal: hs(12),
        height: vs(48),
        marginBottom: vs(20),
        marginTop: vs(8)
    },
    searchIcon: {
        marginRight: hs(8)
    },
    searchInput: {
        flex: 1,
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.black,
        height: "100%"
    },

    listContent: {
        paddingBottom: vs(20)
    },
    cardItem: {
        borderWidth: 1,
        borderColor: COLORS.gray200,
        elevation: 0,
        shadowOpacity: 0
    },
    emptyText: {
        ...FONTS.regular,
        textAlign: "center",
        color: COLORS.gray900,
        marginTop: vs(20)
    },

    footer: {
        marginTop: "auto",
        paddingTop: vs(10)
    },
    cancelButton: {
        backgroundColor: COLORS.primary,
        borderRadius: ms(12),
        height: vs(50),
        justifyContent: "center",
        alignItems: "center"
    },
    cancelButtonText: {
        ...FONTS.semiBold,
        fontSize: ms(16),
        color: COLORS.white
    }
});

export default RecipeSelectionSheetContent;
