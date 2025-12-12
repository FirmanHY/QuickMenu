import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-simple-toast";
import CustomButton from "../components/CustomButton";
import { signOut } from "../services/auth.service";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms } from "../utils/responsive";

const HomeScreen = () => {
    const handleLogout = async () => {
        try {
            await signOut();
            Toast.show("Berhasil keluar.", Toast.SHORT);
        } catch (error) {
            console.error(error);
            Toast.show("Gagal keluar.", Toast.SHORT);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Home Screen</Text>
                <Text style={styles.subtitle}>
                    Selamat datang di Dashboard!
                </Text>

                {/* Tombol Logout */}
                <CustomButton
                    title="Logout"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: ms(24)
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(24),
        color: COLORS.black,
        marginBottom: ms(8)
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: ms(16),
        color: COLORS.gray900,
        marginBottom: ms(32)
    },
    logoutButton: {
        backgroundColor: COLORS.pink,
        width: "50%"
    }
});

export default HomeScreen;
