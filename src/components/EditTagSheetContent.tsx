import React, { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import Toast from "react-native-simple-toast";

import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Chip from "./Chip";

import { COLORS } from "../constants/colors";
import { ms, hs, vs } from "../utils/responsive";

const getTagColor = (category: string) => {
    const colors = [
        { bg: "#E3F2FD", text: "#1565C0" },
        { bg: "#E8F5E9", text: "#2E7D32" },
        { bg: "#FFF3E0", text: "#EF6C00" },
        { bg: "#F3E5F5", text: "#7B1FA2" },
        { bg: "#F5F5F5", text: "#616161" }
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

interface EditTagSheetContentProps {
    initialTags: string[];
    onSave: (newTags: string[]) => Promise<void>;
}

const EditTagSheetContent: React.FC<EditTagSheetContentProps> = ({
    initialTags,
    onSave
}) => {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTags(initialTags || []);
    }, [initialTags]);

    const handleAddTag = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        const exists = tags.some(
            (t) => t.toLowerCase() === trimmed.toLowerCase()
        );

        if (exists) {
            Toast.show("Tag sudah ada", Toast.SHORT);
            return;
        }

        setTags([...tags, trimmed]);
        setInputValue("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleSave = async () => {
        let finalTags = [...tags];
        const trimmed = inputValue.trim();
        if (trimmed) {
            const exists = finalTags.some(
                (t) => t.toLowerCase() === trimmed.toLowerCase()
            );
            if (!exists) finalTags.push(trimmed);
        }

        setIsSaving(true);
        try {
            await onSave(finalTags);
            Keyboard.dismiss();
            setInputValue("");
        } catch (error) {
            console.error("Save tag error", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tagsContainer}>
                {tags.map((tag, index) => {
                    const colors = getTagColor(tag);
                    return (
                        <Chip
                            key={index}
                            label={`#${tag}`}
                            backgroundColor={colors.bg}
                            textColor={colors.text}
                            rightIcon="close" // Icon X
                            onRightIconPress={() => handleRemoveTag(tag)}
                            style={{ marginBottom: vs(8) }}
                        />
                    );
                })}
            </View>
            <CustomInput
                placeholder="Tambah Tag Baru..."
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
                rightIconName={inputValue.length > 0 ? "add" : undefined}
                onRightIconPress={handleAddTag}
                containerStyle={{ marginBottom: vs(8) }}
            />

            <CustomButton
                title={isSaving ? "Menyimpan..." : "Simpan"}
                onPress={handleSave}
                disabled={isSaving}
                style={styles.saveBtn}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: vs(24)
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: hs(8),
        marginBottom: vs(16)
    },
    saveBtn: {
        marginTop: vs(16),
        backgroundColor: COLORS.primary
    }
});

export default EditTagSheetContent;
