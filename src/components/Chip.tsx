import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    View
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

interface ChipProps {
    label: string;
    isActive?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    rightIcon?: string;
    onRightIconPress?: () => void;
    backgroundColor?: string;
    textColor?: string;
}

const Chip: React.FC<ChipProps> = ({
    label,
    isActive = false,
    onPress,
    style,
    textStyle,
    rightIcon,
    onRightIconPress,
    backgroundColor,
    textColor
}) => {
    const containerStyle = [
        styles.chipContainer,
        isActive ? styles.activeChip : styles.inactiveChip,
        backgroundColor ? { backgroundColor, borderWidth: 0 } : {},
        style
    ];

    const labelStyle = [
        styles.chipText,
        isActive ? styles.activeText : styles.inactiveText,
        textColor ? { color: textColor } : {},
        textStyle
    ];

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <Text style={labelStyle}>{label}</Text>

            {rightIcon && (
                <TouchableOpacity
                    onPress={onRightIconPress}
                    style={styles.iconContainer}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons
                        name={rightIcon}
                        size={ms(16)}
                        color={
                            textColor ||
                            (isActive ? COLORS.white : COLORS.black)
                        }
                    />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chipContainer: {
        flexDirection: "row",
        paddingHorizontal: hs(16),
        paddingVertical: vs(8),
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start"
    },
    activeChip: {
        backgroundColor: COLORS.primary
    },
    inactiveChip: {
        backgroundColor: COLORS.gray200,
        borderWidth: 1,
        borderColor: COLORS.gray100
    },
    chipText: {
        ...FONTS.semiBold,
        fontSize: ms(14)
    },
    activeText: {
        color: COLORS.white
    },
    inactiveText: {
        color: COLORS.black
    },
    iconContainer: {
        marginLeft: hs(8)
    }
});

export default Chip;
