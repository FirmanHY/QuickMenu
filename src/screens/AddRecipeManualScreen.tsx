import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    ImagePickerResponse,
    launchImageLibrary
} from "react-native-image-picker";
import Toast from "react-native-simple-toast";

import CustomInput from "../components/CustomInput";
import RichTextEditor from "../components/RichTextEditor";
import CustomButton from "../components/CustomButton";
import { createUserRecipe } from "../services/recipe.service";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { hs, vs, ms } from "../utils/responsive";

const AddRecipeManualScreen = () => {
    const navigation = useNavigation();

    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [steps, setSteps] = useState("");
    const [responeImage, setImageResponse] =
        useState<ImagePickerResponse | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<{
        title?: string;
        duration?: string;
        ingredients?: string;
        steps?: string;
    }>({});

    const handleImagePick = async () => {
        const result = await launchImageLibrary({
            mediaType: "photo",
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            selectionLimit: 1,
            includeBase64: true
        });

        if (result.didCancel) return;
        if (result.errorCode) {
            Alert.alert("Error", "Gagal mengambil gambar.");
            return;
        }
        if (result.assets && result.assets.length > 0) {
            setImageResponse(result);
        }
    };

    const handleRemoveImage = () => {
        setImageResponse(null);
    };

    const handleChange = (
        field: keyof typeof errors,
        value: string,
        setter: (val: string) => void
    ) => {
        setter(value);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const stripHtml = (html: string): string => {
        if (!html) return "";
        const regex = /(<([^>]+)>)/gi;
        return html.replace(regex, "").trim();
    };

    const validate = () => {
        let valid = true;
        let tempErrors: typeof errors = {};

        if (!title.trim()) {
            tempErrors.title = "Judul resep wajib diisi";
            valid = false;
        }

        if (!duration.trim()) {
            tempErrors.duration = "Durasi wajib diisi";
            valid = false;
        }

        if (!stripHtml(ingredients)) {
            tempErrors.ingredients = "Bahan-bahan tidak boleh kosong";
            valid = false;
        }

        if (!stripHtml(steps)) {
            tempErrors.steps = "Langkah-langkah tidak boleh kosong";
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Toast.show("Mohon lengkapi semua field", Toast.SHORT);
            return;
        }

        setIsLoading(true);
        try {
            const recipeData = {
                title,
                duration: `${duration} Min`,
                ingredients,
                steps,
                imageUri: responeImage,
                categories: selectedCategories
            };

            await createUserRecipe(recipeData);

            Toast.show("Resep berhasil disimpan!", Toast.SHORT);

            setTimeout(() => {
                navigation.goBack();
            }, 500);
        } catch (error: any) {
            console.error("Error saving recipe:", error);
            Alert.alert("Error", error.message || "Gagal menyimpan resep");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={["bottom", "left", "right"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.imageContainerWrapper}>
                        {responeImage?.assets && responeImage?.assets[0].uri ? (
                            <View style={styles.uploadedImageContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleImagePick}
                                    style={styles.fullSize}
                                >
                                    <Image
                                        source={{
                                            uri: responeImage.assets[0].uri
                                        }}
                                        style={styles.uploadedImage}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={handleRemoveImage}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={ms(18)}
                                        color={COLORS.white}
                                    />
                                </TouchableOpacity>

                                <View style={styles.editLabelContainer}>
                                    <Text style={styles.editLabelText}>
                                        Ketuk untuk ganti
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadPlaceholder}
                                onPress={handleImagePick}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons
                                    name="camera-alt"
                                    size={ms(40)}
                                    color={COLORS.gray900}
                                />
                                <Text style={styles.uploadText}>
                                    Upload Foto Masakan
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Judul Resep"
                            placeholder="Misal : Sup Ayam"
                            value={title}
                            onChangeText={(text) =>
                                handleChange("title", text, setTitle)
                            }
                            error={errors.title}
                        />

                        <CustomInput
                            label="Durasi (menit)"
                            placeholder="Misal : 30"
                            value={duration}
                            onChangeText={(text) =>
                                handleChange("duration", text, setDuration)
                            }
                            keyboardType="numeric"
                            error={errors.duration}
                        />
                        <RichTextEditor
                            label="Bahan-bahan"
                            placeholder="Satu bahan per baris..."
                            value={ingredients}
                            onChangeText={(html) =>
                                handleChange(
                                    "ingredients",
                                    html,
                                    setIngredients
                                )
                            }
                            error={errors.ingredients}
                            minHeight={150}
                        />

                        <RichTextEditor
                            label="Langkah-langkah"
                            placeholder="Jelaskan cara memasaknya..."
                            value={steps}
                            onChangeText={(html) =>
                                handleChange("steps", html, setSteps)
                            }
                            error={errors.steps}
                            minHeight={200}
                        />

                        <CustomButton
                            title="Simpan Resep"
                            onPress={handleSubmit}
                            isLoading={isLoading}
                            style={styles.submitButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    scrollContent: {
        paddingHorizontal: hs(24),
        paddingTop: vs(24),
        paddingBottom: vs(50)
    },
    imageContainerWrapper: {
        width: "100%",
        height: vs(200),
        marginBottom: vs(24),
        borderRadius: ms(16),
        overflow: "hidden",
        backgroundColor: COLORS.gray200
    },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.gray200,
        borderStyle: "dashed"
    },
    uploadText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900,
        marginTop: vs(8)
    },

    uploadedImageContainer: {
        flex: 1,
        position: "relative"
    },
    fullSize: {
        width: "100%",
        height: "100%"
    },
    uploadedImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },

    removeButton: {
        position: "absolute",
        top: vs(10),
        right: hs(10),
        backgroundColor: "rgba(0,0,0,0.6)", // Hitam transparan
        width: ms(30),
        height: ms(30),
        borderRadius: ms(15),
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10
    },

    editLabelContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingVertical: vs(4),
        alignItems: "center"
    },
    editLabelText: {
        ...FONTS.regular,
        fontSize: ms(10),
        color: COLORS.white
    },
    formContainer: {
        flex: 1
    },
    submitButton: {
        marginTop: vs(12)
    }
});

export default AddRecipeManualScreen;
