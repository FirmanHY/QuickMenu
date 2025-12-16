import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ViewStyle
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

export interface MealItemData {
    id: string;
    recipeId: string;
    title: string;
    imageUrl?: string;
}

type MealType = "breakfast" | "lunch" | "dinner";

interface DailyMealCardProps {
    date: string;
    breakfast: MealItemData | null;
    lunch: MealItemData | null;
    dinner: MealItemData | null;
    onRemove: (type: "breakfast" | "lunch" | "dinner", id: string) => void;
    onAdd: (type: MealType) => void;
    onPressMeal?: (mealId: string) => void;
    style?: ViewStyle;
}

const DailyMealCard: React.FC<DailyMealCardProps> = ({
    date,
    breakfast,
    lunch,
    dinner,
    onRemove,
    onAdd,
    onPressMeal,
    style
}) => {
    const renderMealRow = (
        label: string,
        type: MealType,
        data?: MealItemData | null
    ) => {
        return (
            <View style={styles.rowContainer}>
                <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>{label}:</Text>
                </View>

                {data ? (
                    <TouchableOpacity
                        style={styles.mealItemContainer}
                        activeOpacity={0.8}
                        onPress={() =>
                            onPressMeal && onPressMeal(data.recipeId)
                        }
                    >
                        <Image
                            source={{
                                uri:
                                    data.imageUrl ||
                                    "https://via.placeholder.com/150"
                            }}
                            style={styles.mealImage}
                        />

                        <Text style={styles.mealTitle} numberOfLines={2}>
                            {data.title}
                        </Text>

                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => onRemove(type, data.id)}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10
                            }}
                        >
                            <MaterialIcons
                                name="close"
                                size={ms(14)}
                                color={COLORS.white}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.emptyContainer}
                        onPress={() => onAdd(type)}
                        activeOpacity={0.6}
                    >
                        <MaterialIcons
                            name="add"
                            size={ms(16)}
                            color={COLORS.gray100}
                            style={{ marginRight: hs(4) }}
                        />
                        <Text style={styles.addText}>Tambah</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };
    return (
        <View style={[styles.cardContainer, style]}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{date}</Text>
            </View>

            <View style={styles.content}>
                {renderMealRow("Pagi", "breakfast", breakfast)}
                {renderMealRow("Siang", "lunch", lunch)}
                {renderMealRow("Malam", "dinner", dinner)}

                {!breakfast && !lunch && !dinner && (
                    <Text style={styles.emptyText}>Belum ada rencana menu</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: COLORS.white,
        borderRadius: ms(16),
        borderWidth: 1,
        borderColor: COLORS.gray200,
        marginBottom: vs(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: "hidden"
    },
    header: {
        backgroundColor: COLORS.pink,
        paddingVertical: vs(12),
        alignItems: "center",
        justifyContent: "center"
    },
    headerText: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.black
    },
    content: {
        paddingVertical: vs(16),
        paddingHorizontal: hs(16),
        gap: vs(12)
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    labelContainer: {
        width: hs(60),
        justifyContent: "center"
    },
    labelText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900
    },
    mealItemContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.lime,
        borderColor: COLORS.green,
        borderWidth: 1,
        borderRadius: ms(12),
        padding: ms(8),
        marginLeft: hs(8)
    },
    mealImage: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(8),
        marginRight: hs(10)
    },
    mealTitle: {
        ...FONTS.semiBold,
        fontSize: ms(13),
        color: COLORS.black,
        flex: 1,
        marginRight: hs(8)
    },
    removeButton: {
        width: ms(24),
        height: ms(24),
        borderRadius: ms(12),
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center"
    },
    emptyText: {
        ...FONTS.regular,
        textAlign: "center",
        color: COLORS.gray100,
        fontStyle: "italic",
        marginTop: vs(8)
    },
    emptyContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: vs(50),
        borderWidth: 1,
        borderColor: COLORS.gray100,
        borderStyle: "dashed",
        borderRadius: ms(12),
        marginLeft: hs(8)
    },
    addText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray100
    }
});

export default DailyMealCard;
