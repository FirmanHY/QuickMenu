import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-simple-toast"; // <--- Pakai Simple Toast
import { NavigationProps } from "../navigation/types";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../services/auth.service";

const RegisterScreen = () => {
    const navigation = useNavigation<NavigationProps>();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);

    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validate = () => {
        let valid = true;
        let tempErrors: typeof errors = {};

        const nameRegex = /^[a-zA-Z\s]{3,}$/;
        if (!fullName) {
            tempErrors.fullName = "Nama wajib diisi";
            valid = false;
        } else if (!nameRegex.test(fullName)) {
            tempErrors.fullName = "Min 3 huruf, tanpa angka/simbol";
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            tempErrors.email = "Email wajib diisi";
            valid = false;
        } else if (!emailRegex.test(email)) {
            tempErrors.email = "Format email salah";
            valid = false;
        }

        if (!password) {
            tempErrors.password = "Password wajib diisi";
            valid = false;
        } else if (password.length < 8) {
            tempErrors.password = "Min 8 karakter";
            valid = false;
        }

        if (!confirmPassword) {
            tempErrors.confirmPassword = "Konfirmasi password wajib";
            valid = false;
        } else if (password !== confirmPassword) {
            tempErrors.confirmPassword = "Password tidak sama";
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

    const handleChange = (
        field: keyof typeof errors,
        value: string,
        setter: (val: string) => void
    ) => {
        setter(value);
        if (errors[field])
            setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleRegister = async () => {
        if (validate()) {
            setIsLoading(true);
            try {
                await signUp(email, password, fullName);

                Toast.show("Registrasi Berhasil! Mengalihkan...", Toast.LONG);

                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }] // Atau ke Home jika auto-login
                    });
                }, 1000);
            } catch (error: any) {
                let errorMsg = "Terjadi kesalahan saat registrasi.";
                if (error.code === "auth/email-already-in-use") {
                    errorMsg = "Email sudah terdaftar!";
                } else if (error.code === "auth/invalid-email") {
                    errorMsg = "Email tidak valid!";
                }

                Toast.show(errorMsg, Toast.LONG);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleLoginLink = () => navigation.navigate("Login");

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Buat Akun Baru</Text>
                        <Text style={styles.subtitle}>
                            Isi data di bawah untuk mendaftar
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Nama Lengkap"
                            placeholder="Masukan Nama Lengkap"
                            iconName="person"
                            value={fullName}
                            onChangeText={(text) =>
                                handleChange("fullName", text, setFullName)
                            }
                            autoCapitalize="words"
                            error={errors.fullName}
                        />
                        <CustomInput
                            label="Email"
                            placeholder="Masukan Email"
                            iconName="email"
                            value={email}
                            onChangeText={(text) =>
                                handleChange("email", text, setEmail)
                            }
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />
                        <CustomInput
                            label="Password"
                            placeholder="Masukan Password"
                            iconName="lock"
                            value={password}
                            onChangeText={(text) =>
                                handleChange("password", text, setPassword)
                            }
                            secureTextEntry={!isPasswordVisible}
                            rightIconName={
                                isPasswordVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                            onRightIconPress={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                            }
                            error={errors.password}
                        />
                        <CustomInput
                            label="Konfirmasi Password"
                            placeholder="Konfirmasi Password"
                            iconName="lock"
                            value={confirmPassword}
                            onChangeText={(text) =>
                                handleChange(
                                    "confirmPassword",
                                    text,
                                    setConfirmPassword
                                )
                            }
                            secureTextEntry={!isConfirmPasswordVisible}
                            rightIconName={
                                isConfirmPasswordVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                            onRightIconPress={() =>
                                setIsConfirmPasswordVisible(
                                    !isConfirmPasswordVisible
                                )
                            }
                            error={errors.confirmPassword}
                        />

                        <CustomButton
                            isLoading={isLoading}
                            title="Daftar"
                            onPress={handleRegister}
                            style={styles.registerButton}
                        />
                    </View>
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            Sudah punya akun?{" "}
                        </Text>
                        <TouchableOpacity onPress={handleLoginLink}>
                            <Text style={styles.loginText}>Masuk disini</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: hs(24),
        paddingTop: vs(40),
        paddingBottom: vs(20)
    },
    headerContainer: { alignItems: "center", marginBottom: vs(32) },
    title: {
        ...FONTS.bold,
        fontSize: ms(24),
        color: COLORS.black,
        marginBottom: vs(8),
        textAlign: "center"
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: ms(16),
        color: COLORS.black,
        textAlign: "center"
    },
    formContainer: { width: "100%" },
    registerButton: { marginTop: vs(24) },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "auto",
        paddingTop: vs(30)
    },
    footerText: { ...FONTS.regular, fontSize: ms(14), color: COLORS.black },
    loginText: { ...FONTS.bold, fontSize: ms(14), color: COLORS.primary }
});

export default RegisterScreen;
