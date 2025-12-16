import React, { useState } from "react";
import { View, Text, StyleSheet, Keyboard, ViewStyle } from "react-native";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";

interface LinkImportContentProps {
    onSubmit: (url: string) => void;
    onCancel: () => void;
    containerStyle?: ViewStyle;
}

const LinkImportContent: React.FC<LinkImportContentProps> = ({
    onSubmit,
    onCancel,
    containerStyle
}) => {
    const [link, setLink] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (link.trim().length === 0) {
            setError("Link tidak boleh kosong");
            return;
        }

        if (!link.toLowerCase().startsWith("http")) {
            setError("Pastikan link dimulai dengan http:// atau https://");
            return;
        }

        setError(null);
        onSubmit(link);
        setLink("");
        Keyboard.dismiss();
    };

    const handleCancel = () => {
        setLink("");
        setError(null);
        Keyboard.dismiss();
        onCancel();
    };

    return (
        <View style={[styles.content, containerStyle]}>
            {/* --- Title --- */}
            <Text style={styles.title}>
                Tempel link resep (Blog, Instagram, Tiktok){"\n"}di bawah ini.
            </Text>

            {/* --- Custom Input --- */}
            <CustomInput
                placeholder="https://"
                value={link}
                onChangeText={(text) => {
                    setLink(text);
                    if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                error={error}
                containerStyle={styles.inputContainer}
            />

            {/* --- Button: Tambah Resep (Outline) --- */}
            <CustomButton
                title="Tambah Resep dari Link"
                type="outline"
                onPress={handleSubmit}
                style={styles.buttonSpacing}
            />

            {/* --- Button: Batal (Primary) --- */}
            <CustomButton title="Batal" type="primary" onPress={handleCancel} />
        </View>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingBottom: vs(24),
        alignItems: "center",
        width: "100%"
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.black,
        textAlign: "center",
        marginBottom: vs(24),
        lineHeight: ms(22)
    },
    inputContainer: {
        marginBottom: vs(16)
    },
    buttonSpacing: {
        marginBottom: vs(12)
    }
});

export default LinkImportContent;
