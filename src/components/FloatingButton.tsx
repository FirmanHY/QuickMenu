import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../constants/colors";
import { ms, hs, vs } from "../utils/responsive";

interface FloatingButtonProps {
    onPress: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity
            style={styles.floatingButton}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name="chef-hat"
                    size={ms(28)}
                    color={COLORS.white}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: "absolute",
        bottom: vs(90),
        right: hs(24),
        width: ms(56),
        height: ms(56),
        borderRadius: ms(28),
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center"
    }
});

export default FloatingButton;
