import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-simple-toast";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProps } from "../navigation/types";
import { signIn } from "../services/auth.service";

const LoginScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {}
    );
    const validate = () => {
        let valid = true;
        let tempErrors: { email?: string; password?: string } = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            tempErrors.email = "Email wajib diisi";
            valid = false;
        } else if (!emailRegex.test(email)) {
            tempErrors.email = "Format email tidak valid";
            valid = false;
        }

        if (!password) {
            tempErrors.password = "Password wajib diisi";
            valid = false;
        } else if (password.length < 8) {
            tempErrors.password = "Password minimal 8 karakter";
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

   const handleLogin = async () => {
    if (validate()) {
        setIsLoading(true);
        try {
            await signIn(email, password);
            Toast.show("Login Berhasil!", Toast.SHORT);
        } catch (error: any) {
            let errorMsg = "Terjadi kesalahan. Coba lagi.";

            switch (error.code) {
                // ✅ Email belum diverifikasi
                case "auth/email-not-verified":
                    errorMsg =
                        "Email kamu belum diverifikasi. Cek inbox atau folder spam.";
                    break;

                // ✅ Akun tidak ditemukan
                case "auth/user-not-found":
                case "auth/invalid-email":
                    errorMsg = "Akun tidak ditemukan. Periksa kembali email kamu.";
                    break;

                // ✅ Password salah
                case "auth/wrong-password":
                    errorMsg = "Password salah. Coba lagi.";
                    break;

                // Firebase terbaru menggabungkan 2 error di atas jadi satu
                case "auth/invalid-credential":
                    errorMsg = "Email atau password tidak valid.";
                    break;

                case "auth/too-many-requests":
                    errorMsg = "Terlalu banyak percobaan. Coba lagi nanti.";
                    break;

                case "auth/user-disabled":
                    errorMsg = "Akun ini telah dinonaktifkan.";
                    break;
            }

            Toast.show(errorMsg, Toast.LONG);
        } finally {
            setIsLoading(false);
        }
    }
};

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (errors.email) setErrors({ ...errors, email: undefined });
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (errors.password) setErrors({ ...errors, password: undefined });
    };

    const handleRegister = () => {
        navigation.navigate("Register");
    };

    const handleForgotPassword = () => {
        console.log("Navigate to Forgot Password");
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Selamat Datang !</Text>
                        <Text style={styles.subtitle}>
                            Login untuk melanjutkan ke koleksi resep Anda.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* INPUT EMAIL */}
                        <CustomInput
                            label="Email"
                            placeholder="Masukan Email"
                            iconName="email"
                            value={email}
                            onChangeText={handleEmailChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        {/* INPUT PASSWORD */}
                        <CustomInput
                            label="Password"
                            placeholder="Masukan Password"
                            iconName="lock"
                            value={password}
                            onChangeText={handlePasswordChange}
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

                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Lupa Password?
                            </Text>
                        </TouchableOpacity>

                        <CustomButton
                            title="Login"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            isLoading={isLoading}
                        />
                    </View>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            Belum punya akun?{" "}
                        </Text>
                        <TouchableOpacity onPress={handleRegister}>
                            <Text style={styles.registerText}>
                                Daftar Gratis
                            </Text>
                        </TouchableOpacity>
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
        flexGrow: 1,
        paddingHorizontal: hs(24),
        paddingTop: vs(120)
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: vs(40)
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(24),
        color: COLORS.black,
        marginBottom: vs(12),
        textAlign: "center"
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: ms(16),
        color: COLORS.black,
        textAlign: "center",
        lineHeight: ms(24),
        maxWidth: "80%"
    },
    formContainer: {
        width: "100%"
    },
    forgotPasswordContainer: {
        alignSelf: "flex-end",
        marginBottom: vs(30),
        marginTop: vs(-8)
    },
    forgotPasswordText: {
        ...FONTS.semiBold,
        fontSize: ms(14),
        color: COLORS.primary
    },
    loginButton: {
        marginTop: vs(10)
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: vs(60)
    },
    footerText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.black
    },
    registerText: {
        ...FONTS.bold,
        fontSize: ms(14),
        color: COLORS.primary
    }
});

export default LoginScreen;
