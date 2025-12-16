import React, {
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef
} from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Modal,
    TouchableOpacity
} from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView
} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from "react-native-reanimated";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs, hs } from "../utils/responsive";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

export interface CustomBottomSheetRef {
    open: () => void;
    close: () => void;
}

interface CustomBottomSheetProps {
    title?: string;
    children: React.ReactNode;
}

const CustomBottomSheet = forwardRef<
    CustomBottomSheetRef,
    CustomBottomSheetProps
>(({ title, children }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue({ y: 0 });

    const open = useCallback(() => {
        setIsVisible(true);
        translateY.value = withSpring(0, { damping: 50 });
    }, []);

    const close = useCallback(() => {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
            runOnJS(setIsVisible)(false);
        });
    }, []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = event.translationY + context.value.y;
            translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
        })
        .onEnd(() => {
            if (translateY.value > 100) {
                runOnJS(close)();
            } else {
                translateY.value = withSpring(0, { damping: 50 });
            }
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: Math.max(translateY.value, 0) }]
        };
    });

    const rBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isVisible ? 1 : 0)
        };
    });

    if (!isVisible) return null;

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="none"
            onRequestClose={close}
            statusBarTranslucent
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View style={[styles.backdrop, rBackdropStyle]}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={close}
                        activeOpacity={1}
                    />
                </Animated.View>
                <GestureDetector gesture={gesture}>
                    <Animated.View
                        style={[styles.bottomSheetContainer, rBottomSheetStyle]}
                    >
                        <View style={styles.line} />

                        {title && (
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{title}</Text>
                            </View>
                        )}

                        <View style={styles.contentContainer}>{children}</View>
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
        </Modal>
    );
});

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1 
    },
    bottomSheetContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: COLORS.white,
        borderTopLeftRadius: ms(24),
        borderTopRightRadius: ms(24),
        paddingBottom: vs(30),
        zIndex: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    line: {
        width: hs(50),
        height: vs(4),
        backgroundColor: COLORS.gray200,
        alignSelf: "center",
        marginVertical: vs(12),
        borderRadius: ms(2)
    },
    titleContainer: {
        paddingHorizontal: hs(24),
        marginBottom: vs(16),
        paddingBottom: vs(12)
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(18),
        color: COLORS.black,
        textAlign: "center"
    },
    contentContainer: {
        paddingHorizontal: hs(24)
    }
});

export default CustomBottomSheet;
