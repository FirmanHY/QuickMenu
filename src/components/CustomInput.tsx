import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
    ViewStyle
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs } from "../utils/responsive";

interface CustomInputProps extends TextInputProps {
    label?: string;
    iconName?: string;
    rightIconName?: string;
    onRightIconPress?: () => void;
    error?: string | null;
    containerStyle?: ViewStyle;
}

const CustomInput: React.FC<CustomInputProps> = ({
    label,
    iconName,
    rightIconName,
    onRightIconPress,
    error,
    containerStyle,
    onFocus,
    onBlur,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    const getBorderColor = () => {
        if (error) return COLORS.pink;
        if (isFocused) return COLORS.primary;
        return COLORS.inputBorder;
    };

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    { borderColor: getBorderColor() }
                ]}
            >
                {iconName && (
                    <Icon
                        name={iconName}
                        size={ms(20)}
                        color={isFocused ? COLORS.primary : COLORS.gray900}
                        style={styles.iconLeft}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.gray900}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor={COLORS.primary}
                    {...props}
                />
                {rightIconName && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                        style={styles.iconRight}
                    >
                        <Icon
                            name={rightIconName}
                            size={ms(20)}
                            color={COLORS.gray900}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: vs(16),
        width: "100%"
    },
    label: {
        ...FONTS.semiBold,
        fontSize: ms(14),
        color: COLORS.black,
        marginBottom: vs(6)
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: vs(50),
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderRadius: ms(12),
        paddingHorizontal: ms(14)
    },
    input: {
        ...FONTS.regular,
        flex: 1,
        fontSize: ms(14),
        color: COLORS.black,
        height: "100%",
        paddingVertical: 0
    },
    iconLeft: {
        marginRight: ms(10)
    },
    iconRight: {
        marginLeft: ms(10)
    },
    errorText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: "red",
        marginTop: vs(4),
        marginLeft: ms(4)
    }
});

export default CustomInput;
