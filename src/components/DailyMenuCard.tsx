import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import CustomButton from "./CustomButton";

interface DailyMenuCardProps {
    dayName: string;
    meals: {
        breakfast?: string;
        lunch?: string;
        dinner?: string;
    };
    onPressWeeklyPlan: () => void;
}

const DailyMenuCard: React.FC<DailyMenuCardProps> = ({
    dayName,
    meals,
    onPressWeeklyPlan
}) => {
    const renderMealRow = (label: string, menuName?: string) => (
        <View style={styles.mealRow}>
            <Text style={styles.mealLabel}>{label}</Text>
            <Text style={styles.separator}>:</Text>
            <Text style={[styles.mealValue, !menuName && styles.emptyValue]}>
                {menuName || "-"}
            </Text>
        </View>
    );

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Menu Hari ini ({dayName})</Text>

            <View style={styles.menuContainer}>
                {renderMealRow("Pagi", meals.breakfast)}
                {renderMealRow("Siang", meals.lunch)}
                {renderMealRow("Malam", meals.dinner)}
            </View>

            <CustomButton
                title="Lihat Rencana Mingguan"
                onPress={onPressWeeklyPlan}
                type="primary"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 4
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 16
    },
    menuContainer: {
        marginBottom: 20,
        gap: 8
    },
    mealRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 4
    },
    mealLabel: {
        width: 60,
        fontSize: 14,
        color: COLORS.gray900
    },
    separator: {
        fontSize: 14,
        color: COLORS.gray900,
        marginRight: 8
    },
    mealValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.primary
    },
    emptyValue: {
        color: COLORS.gray900
    }
});

export default DailyMenuCard;
