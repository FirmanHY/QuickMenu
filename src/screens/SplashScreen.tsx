import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    StatusBar
} from "react-native";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs } from "../utils/responsive";
import LogoImage from "../assets/quick_menu_icon.png";

const SplashScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000, // Durasi 1 detik
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <Animated.View
                style={[
                    styles.contentContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}
            >
                <View style={styles.iconPlaceholder}>
                    <Image
                        source={LogoImage}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>QuickMenu</Text>
                <Text style={styles.subtitle}>Asisten Resep Cerdas Anda</Text>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center"
    },
    contentContainer: {
        alignItems: "center",
        justifyContent: "center"
    },

    logo: {
        width: ms(100),
        height: ms(100),
        marginBottom: vs(20)
    },
    iconPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: vs(24)
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(32),
        color: COLORS.black,
        marginBottom: vs(8),
        letterSpacing: 0.5
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: ms(16),
        color: COLORS.black,
        opacity: 0.8
    },
    footer: {
        position: "absolute",
        bottom: vs(40)
    },
    footerText: {
        ...FONTS.regular,
        fontSize: ms(12),
        color: "#CCCCCC"
    }
});

export default SplashScreen;
