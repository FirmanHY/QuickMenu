import React from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ImageSourcePropType
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

interface RecipeCardProps {
    imageUrl: string | ImageSourcePropType;
    title: string;
    duration: string;
    category?: string;
    variant?: "large" | "small";
    showBookmark?: boolean;
    isBookmarked?: boolean;
    onPress?: () => void;
    onBookmarkPress?: () => void;
    source?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
    imageUrl,
    title,
    duration,
    category,
    variant = "large",
    showBookmark = false,
    isBookmarked = false,
    onPress,
    onBookmarkPress,
    source
}) => {
    const isLarge = variant === "large";

    return (
        <TouchableOpacity
            style={[styles.card, isLarge ? styles.largeCard : styles.smallCard]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.imageWrapper}>
                <View
                    style={[
                        styles.imageContainer,
                        isLarge
                            ? styles.largeImageContainer
                            : styles.smallImageContainer
                    ]}
                >
                    <Image
                        source={
                            typeof imageUrl === "string"
                                ? { uri: imageUrl }
                                : imageUrl
                        }
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {showBookmark && (
                        <TouchableOpacity
                            style={styles.bookmarkButton}
                            onPress={onBookmarkPress}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons
                                name={
                                    isBookmarked
                                        ? "bookmark"
                                        : "bookmark-border"
                                }
                                size={ms(24)}
                                color={COLORS.white}
                            />
                        </TouchableOpacity>
                    )}

                    {source && (
                        <View style={styles.sourceBadge}>
                            <Text style={styles.sourceText}>{source}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.contentContainer}>
                <Text
                    style={[
                        styles.title,
                        isLarge ? styles.largeTitle : styles.smallTitle
                    ]}
                    numberOfLines={2}
                >
                    {title}
                </Text>

                <View style={styles.durationContainer}>
                    <MaterialIcons
                        name="access-time"
                        size={ms(16)}
                        color={COLORS.gray900}
                    />
                    <Text style={styles.durationText}>{duration} Min</Text>
                </View>

                {category && (
                    <Text style={styles.categoryText}>{category}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
    },
    largeCard: {
        width: hs(280),
        marginRight: hs(16)
    },
    smallCard: {
        width: hs(160)
    },
    imageWrapper: {
        padding: hs(8) // Space around image
    },
    imageContainer: {
        position: "relative",
        backgroundColor: COLORS.gray200,
        borderRadius: 20, // Border radius untuk image
        overflow: "hidden" // Important untuk border radius
    },
    largeImageContainer: {
        height: vs(160)
    },
    smallImageContainer: {
        height: vs(100)
    },
    image: {
        width: "100%",
        height: "100%"
    },
    bookmarkButton: {
        position: "absolute",
        top: vs(8),
        left: hs(8),
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 4,
        padding: hs(4),
        justifyContent: "center",
        alignItems: "center"
    },
    sourceBadge: {
        position: "absolute",
        top: vs(8),
        left: hs(8),
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: hs(12),
        paddingVertical: vs(6),
        borderRadius: 4
    },
    sourceText: {
        ...FONTS.semiBold,
        fontSize: ms(12),
        color: COLORS.white
    },
    contentContainer: {
        paddingHorizontal: hs(12),
        paddingBottom: hs(12)
    },
    title: {
        ...FONTS.bold,
        color: COLORS.black,
        marginBottom: vs(8)
    },
    largeTitle: {
        fontSize: ms(16),
        lineHeight: ms(22)
    },
    smallTitle: {
        fontSize: ms(14),
        lineHeight: ms(18)
    },
    durationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: vs(4)
    },
    durationText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.gray900,
        marginLeft: hs(4)
    },
    categoryText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.primary,
        marginTop: vs(4)
    }
});

export default RecipeCard;
