import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
    RichEditor,
    RichToolbar,
    actions
} from "react-native-pell-rich-editor";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";

interface RichTextEditorProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    error?: string;
    minHeight?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    label,
    placeholder = "Tulis resep lengkap disini...",
    value = "",
    onChangeText,
    error,
    minHeight = 150
}) => {
    const richText = useRef<RichEditor>(null);
    const [isFocused, setIsFocused] = useState(false);

    const getBorderColor = () => {
        if (error) return "red";
        if (isFocused) return COLORS.primary;
        return COLORS.gray200;
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.editorWrapper,
                    {
                        borderColor: getBorderColor(),
                        borderWidth: isFocused || error ? 1.5 : 1
                    }
                ]}
            >
                <RichToolbar
                    editor={richText}
                    selectedIconTint={COLORS.primary}
                    iconTint={COLORS.black}
                    style={styles.toolbar}
                    actions={[
                        actions.setBold,
                        actions.setItalic,
                        actions.insertBulletsList,
                        actions.insertOrderedList
                    ]}
                />
                <View style={styles.separator} />

                <RichEditor
                    ref={richText}
                    initialContentHTML={value}
                    placeholder={placeholder}
                    onChange={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editorStyle={{
                        backgroundColor: COLORS.white,
                        color: COLORS.black,
                        placeholderColor: COLORS.gray900,
                        contentCSSText: `
                            font-family: ${FONTS.regular.fontFamily}; 
                            font-size: 14px; 
                            min-height: ${minHeight}px;
                        `
                    }}
                    style={{
                        minHeight: vs(minHeight),
                        flex: 1
                    }}
                    useContainer={true}
                />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: vs(16),
        width: "100%"
    },
    label: {
        ...FONTS.semiBold,
        fontSize: ms(14),
        color: COLORS.black,
        marginBottom: vs(6)
    },
    editorWrapper: {
        borderRadius: ms(12),
        backgroundColor: COLORS.white,
        overflow: "hidden"
    },
    toolbar: {
        backgroundColor: COLORS.gray100,
        borderBottomWidth: 0,
        height: vs(44)
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.gray200,
        width: "100%"
    },
    errorText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: "red",
        marginTop: vs(4),
        marginLeft: ms(4)
    }
});

export default RichTextEditor;
