import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps
} from "react-native";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs } from "../utils/responsive";

interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    onPress: () => void;
    type?: "primary" | "outline";
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    type = "primary",
    isLoading = false,
    disabled = false,
    style,
    ...props
}) => {
    const getButtonStyle = () => {
        if (disabled) {
            return type === "primary"
                ? styles.disabledPrimary
                : styles.disabledOutline;
        }
        return type === "primary" ? styles.bgPrimary : styles.bgOutline;
    };

    const getTextStyle = () => {
        if (disabled) {
            return styles.textDisabled;
        }
        return type === "primary" ? styles.textPrimary : styles.textOutline;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
            style={[styles.container, getButtonStyle(), style]}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    size="small"
                    color={type === "primary" ? COLORS.white : COLORS.primary}
                />
            ) : (
                <Text style={[styles.text, getTextStyle()]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: vs(52),
        borderRadius: ms(12),
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    text: {
        ...FONTS.semiBold,
        fontSize: ms(16)
    },

    bgPrimary: {
        backgroundColor: COLORS.primary,
        borderWidth: 0
    },
    textPrimary: {
        color: COLORS.white
    },

    bgOutline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    textOutline: {
        color: COLORS.primary
    },

    disabledPrimary: {
        backgroundColor: COLORS.gray100
    },
    disabledOutline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: COLORS.gray100
    },
    textDisabled: {
        color: COLORS.gray900
    }
});

export default CustomButton;
