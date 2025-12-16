import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, vs } from "../utils/responsive";

interface TabSwitcherProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    containerStyle?: object;
}

const TabSwitcher = ({
    tabs,
    activeTab,
    onTabChange,
    containerStyle
}: TabSwitcherProps) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {tabs.map((tab, index) => {
                const isActive = activeTab === tab;

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.tabButton,
                            isActive && styles.activeTabButton
                        ]}
                        onPress={() => onTabChange(tab)}
                        activeOpacity={0.9}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                isActive
                                    ? styles.activeTabText
                                    : styles.inactiveTabText
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: COLORS.gray100,
        borderRadius: ms(30),
        padding: ms(4),
        height: vs(50)
    },
    tabButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: ms(24)
    },
    activeTabButton: {
        backgroundColor: COLORS.black,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
    },
    tabText: {
        fontSize: ms(14),
        ...FONTS.semiBold
    },
    activeTabText: {
        color: COLORS.white
    },
    inactiveTabText: {
        color: COLORS.black
    }
});

export default TabSwitcher;
