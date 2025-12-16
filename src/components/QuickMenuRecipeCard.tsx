import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ViewStyle
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";

interface QuickMenuRecipeCardProps {
    title: string;
    image: string;
    duration: string;
    category: string;
    onPress: () => void;
    isBookmarked?: boolean;
    onBookmarkPress?: () => void;
    style?: ViewStyle;
}

const QuickMenuRecipeCard: React.FC<QuickMenuRecipeCardProps> = ({
    title,
    image,
    duration,
    category,
    onPress,
    isBookmarked,
    onBookmarkPress,
    style
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {onBookmarkPress && (
                    <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={onBookmarkPress}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={
                                isBookmarked ? "bookmark" : "bookmark-outline"
                            }
                            size={ms(20)}
                            color={COLORS.white}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <View style={styles.metaRow}>
                    <MaterialCommunityIcons
                        name="clock-time-four"
                        size={ms(14)}
                        color={COLORS.gray900}
                    />
                    <Text style={styles.metaText}>{duration}</Text>
                </View>

                <Text style={styles.categoryText}>{category}</Text>
            </View>

            <View style={styles.arrowContainer}>
                <View style={styles.arrowButton}>
                    <MaterialIcons
                        name="arrow-forward"
                        size={ms(20)}
                        color={COLORS.white}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: COLORS.white,
        borderRadius: ms(28),
        padding: ms(10),
        marginBottom: vs(16),
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    imageWrapper: {
        width: hs(90),
        height: hs(90),
        borderRadius: ms(20),
        overflow: "hidden",
        backgroundColor: COLORS.gray200
    },
    image: {
        width: "100%",
        height: "100%"
    },
    bookmarkButton: {
        position: "absolute",
        top: vs(8),
        left: hs(8),
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: ms(8),
        padding: ms(6),
        justifyContent: "center",
        alignItems: "center"
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: hs(14),
        justifyContent: "center"
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: "#0A2533",
        marginBottom: vs(6),
        lineHeight: ms(22)
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: vs(4)
    },
    metaText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.gray900,
        marginLeft: hs(4)
    },
    categoryText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.gray900
    },
    arrowContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingRight: hs(8)
    },
    arrowButton: {
        width: ms(38),
        height: ms(38),
        borderRadius: ms(8),
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default QuickMenuRecipeCard;
