// screens/ImportPreviewScreen.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import RenderHtml from "react-native-render-html";
import Toast from "react-native-simple-toast";

import CustomButton from "../components/CustomButton";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

import { scrapeRecipe, ScrapedRecipe } from "../services/scraper.service";
import { createUserRecipe } from "../services/recipe.service";
import { RootStackParamList, NavigationProps } from "../navigation/types";

type ImportPreviewRouteProp = RouteProp<RootStackParamList, "ImportPreview">;

const ImportPreviewScreen = () => {
    const route = useRoute<ImportPreviewRouteProp>();
    const navigation = useNavigation<NavigationProps>();
    const { width } = useWindowDimensions();

    const { url } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [recipe, setRecipe] = useState<ScrapedRecipe | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRecipe();
    }, [url]);

    const loadRecipe = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const scrapedData = await scrapeRecipe(url);
            setRecipe(scrapedData);
        } catch (err: any) {
            console.error("Scraping error:", err);
            setError(err.message || "Gagal mengambil resep");

            Alert.alert(
                "Gagal Import",
                err.message || "Tidak dapat mengambil resep dari link ini",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!recipe) return;

        try {
            setIsSaving(true);

            // Save to Firestore (without image for now)
            await createUserRecipe({
                title: recipe.title,
                duration: recipe.duration,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                imageUri: null, // No image for now
                categories: [],
                source: recipe.source,
                originalUrl: recipe.originalUrl
            });

            Toast.show("Resep berhasil disimpan", Toast.SHORT);

            // Navigate back to collection
            navigation.goBack();
        } catch (err: any) {
            console.error("Save error:", err);
            Alert.alert("Error", err.message || "Gagal menyimpan resep");
        } finally {
            setIsSaving(false);
        }
    };

    const htmlStyles = {
        body: {
            color: COLORS.black,
            ...FONTS.regular,
            fontSize: ms(14)
        },
        li: { marginBottom: 6 },
        ul: { marginTop: 0, paddingLeft: 20 },
        ol: { marginTop: 0, paddingLeft: 20 }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Mengambil resep...</Text>
                    <Text style={styles.loadingSubtext}>
                        Harap tunggu sebentar
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !recipe) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>❌ Gagal Import</Text>
                    <Text style={styles.errorSubtext}>{error}</Text>
                    <CustomButton
                        title="Kembali"
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Preview Resep</Text>
                    <View style={styles.sourceBadge}>
                        <Text style={styles.sourceText}>{recipe.source}</Text>
                    </View>
                </View>

                {/* Recipe Title */}
                <Text style={styles.title}>{recipe.title}</Text>

                {/* Duration */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Durasi:</Text>
                    <Text style={styles.metaValue}>{recipe.duration} Min</Text>
                </View>

                {/* Original Link */}
                <View style={styles.linkContainer}>
                    <Text style={styles.linkLabel}>Sumber:</Text>
                    <Text style={styles.linkText} numberOfLines={1}>
                        {recipe.originalUrl}
                    </Text>
                </View>

                {/* Ingredients */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bahan-Bahan</Text>
                    <RenderHtml
                        contentWidth={width - hs(48)}
                        source={{ html: recipe.ingredients }}
                        tagsStyles={htmlStyles}
                    />
                </View>

                {/* Steps */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Langkah-Langkah</Text>
                    <RenderHtml
                        contentWidth={width - hs(48)}
                        source={{ html: recipe.steps }}
                        tagsStyles={htmlStyles}
                    />
                </View>

                {/* Info Note */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ℹ️ Gambar belum tersimpan. Kamu bisa tambahkan nanti
                        saat edit resep.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <CustomButton
                    title="Batal"
                    onPress={() => navigation.goBack()}
                    variant="outline"
                    style={styles.cancelButton}
                />
                <CustomButton
                    title={isSaving ? "Menyimpan..." : "Simpan Resep"}
                    onPress={handleSave}
                    disabled={isSaving}
                    style={styles.saveButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    scrollContent: {
        paddingHorizontal: hs(24),
        paddingTop: vs(16),
        paddingBottom: vs(100)
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.black,
        marginTop: vs(16)
    },
    loadingSubtext: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        marginTop: vs(8)
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: hs(40)
    },
    errorText: {
        ...FONTS.bold,
        fontSize: ms(20),
        color: COLORS.black,
        marginBottom: vs(12)
    },
    errorSubtext: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        textAlign: "center",
        marginBottom: vs(24)
    },
    backButton: {
        minWidth: hs(120)
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: vs(16)
    },
    headerTitle: {
        ...FONTS.bold,
        fontSize: ms(18),
        color: COLORS.black
    },
    sourceBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: hs(12),
        paddingVertical: vs(4),
        borderRadius: ms(8)
    },
    sourceText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.white
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(24),
        color: COLORS.black,
        marginBottom: vs(16)
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: vs(12)
    },
    metaLabel: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        marginRight: hs(8)
    },
    metaValue: {
        ...FONTS.bold,
        fontSize: ms(14),
        color: COLORS.black
    },
    linkContainer: {
        backgroundColor: COLORS.gray100,
        padding: ms(12),
        borderRadius: ms(8),
        marginBottom: vs(24)
    },
    linkLabel: {
        ...FONTS.bold,
        fontSize: ms(12),
        color: COLORS.gray900,
        marginBottom: vs(4)
    },
    linkText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.primary
    },
    section: {
        marginBottom: vs(24)
    },
    sectionTitle: {
        ...FONTS.bold,
        fontSize: ms(18),
        color: COLORS.black,
        marginBottom: vs(12)
    },
    infoBox: {
        backgroundColor: "#FFF9E6",
        padding: ms(12),
        borderRadius: ms(8),
        borderLeftWidth: 4,
        borderLeftColor: "#FFA726"
    },
    infoText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: "#6D4C00",
        lineHeight: ms(18)
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        gap: hs(12),
        paddingHorizontal: hs(24),
        paddingVertical: vs(16),
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 10
    },
    cancelButton: {
        flex: 1
    },
    saveButton: {
        flex: 2
    }
});

export default ImportPreviewScreen;
