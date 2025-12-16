import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

interface AddRecipeContentProps {
    onImportFromLink: () => void;
    onAddManual: () => void;
    onCancel: () => void;
}

const AddRecipeContent: React.FC<AddRecipeContentProps> = ({
    onImportFromLink,
    onAddManual,
    onCancel
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.description}>
                Simpan resep baru ke koleksi Anda.
            </Text>

            {/* Import from Link Button */}
            <TouchableOpacity
                style={styles.optionButton}
                onPress={onImportFromLink}
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons
                    name="link-variant"
                    size={ms(24)}
                    color={COLORS.primary}
                />
                <Text style={styles.optionText}>
                    Impor dari Link (Blog,IG,etc)
                </Text>
            </TouchableOpacity>

            {/* Add Manual Button */}
            <TouchableOpacity
                style={styles.optionButton}
                onPress={onAddManual}
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons
                    name="pencil-outline"
                    size={ms(24)}
                    color={COLORS.primary}
                />
                <Text style={styles.optionText}>Tambah Resep Manual</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
            >
                <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: vs(24)
    },
    description: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        textAlign: "center",
        marginBottom: vs(24)
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        borderRadius: ms(12),
        paddingVertical: vs(16),
        paddingHorizontal: hs(20),
        marginBottom: vs(16)
    },
    optionText: {
        ...FONTS.semiBold,
        fontSize: ms(16),
        color: COLORS.primary,
        marginLeft: hs(16),
        flex: 1
    },
    cancelButton: {
        backgroundColor: COLORS.primary,
        borderRadius: ms(12),
        paddingVertical: vs(16),
        alignItems: "center",
        marginTop: vs(8)
    },
    cancelText: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.white
    }
});

export default AddRecipeContent;
