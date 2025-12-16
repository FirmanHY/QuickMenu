import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { ms, hs, vs } from "../utils/responsive";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface ScheduleRecipeSheetContentProps {
    onClose: () => void;
    onSave: (date: Date, timeSlot: "breakfast" | "lunch" | "dinner") => void;
}

const ScheduleRecipeSheetContent: React.FC<ScheduleRecipeSheetContentProps> = ({
    onClose,
    onSave
}) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<
        "breakfast" | "lunch" | "dinner"
    >("breakfast");

    const calendarGrid = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const grid = [];

        for (let i = startDayIndex - 1; i >= 0; i--) {
            grid.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                dateObj: new Date(year, month - 1, daysInPrevMonth - i)
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({
                day: i,
                isCurrentMonth: true,
                dateObj: new Date(year, month, i)
            });
        }

        const remainingCells = 42 - grid.length;
        for (let i = 1; i <= remainingCells; i++) {
            grid.push({
                day: i,
                isCurrentMonth: false,
                dateObj: new Date(year, month + 1, i)
            });
        }

        return grid;
    }, [viewDate]);

    const handlePrevMonth = () => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setViewDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setViewDate(newDate);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return (
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear()
        );
    };

    const handleSave = () => {
        onSave(selectedDate, selectedTime);
        onClose();
    };

    const monthLabel = viewDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.dragHandle} />
                <Text style={styles.title}>Jadwalkan Resep</Text>
            </View>

            <View style={styles.monthNav}>
                <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={styles.arrowBtn}
                >
                    <MaterialIcons
                        name="keyboard-double-arrow-left"
                        size={ms(24)}
                        color={COLORS.black}
                    />
                </TouchableOpacity>

                <View style={styles.monthCapsule}>
                    <Text style={styles.monthText}>{monthLabel}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleNextMonth}
                    style={styles.arrowBtn}
                >
                    <MaterialIcons
                        name="keyboard-double-arrow-right"
                        size={ms(24)}
                        color={COLORS.black}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.calendarContainer}>
                <View style={styles.row}>
                    {DAY_LABELS.map((label, index) => (
                        <Text key={index} style={styles.dayLabel}>
                            {label}
                        </Text>
                    ))}
                </View>

                <View style={styles.datesGrid}>
                    {calendarGrid.map((item, index) => {
                        const isSelected = isSameDay(
                            item.dateObj,
                            selectedDate
                        );

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateCell,
                                    isSelected && styles.dateCellSelected
                                ]}
                                onPress={() => setSelectedDate(item.dateObj)}
                            >
                                <Text
                                    style={[
                                        styles.dateText,
                                        !item.isCurrentMonth &&
                                            styles.dateTextDisabled,
                                        isSelected && styles.dateTextSelected
                                    ]}
                                >
                                    {item.day}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.timeSection}>
                <Text style={styles.sectionTitle}>Waktu</Text>
                <View style={styles.timeOptions}>
                    {(["breakfast", "lunch", "dinner"] as const).map((type) => {
                        const isSelected = selectedTime === type;
                        const labelMap = {
                            breakfast: "Pagi",
                            lunch: "Siang",
                            dinner: "Malam"
                        };

                        return (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.timeChip,
                                    isSelected && styles.timeChipSelected
                                ]}
                                onPress={() => setSelectedTime(type)}
                            >
                                <Text
                                    style={[
                                        styles.timeText,
                                        isSelected && styles.timeTextSelected
                                    ]}
                                >
                                    {labelMap[type]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Simpan Jadwal</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: vs(24),
        backgroundColor: COLORS.white
    },
    header: {
        alignItems: "center",
        marginBottom: vs(20)
    },
    dragHandle: {
        width: ms(40),
        height: ms(4),
        backgroundColor: COLORS.gray900,
        borderRadius: ms(2),
        marginTop: vs(8),
        marginBottom: vs(16)
    },
    title: {
        ...FONTS.bold,
        fontSize: ms(18),
        color: COLORS.black
    },

    monthNav: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: vs(24),
        gap: hs(16)
    },
    arrowBtn: {
        padding: ms(4)
    },
    monthCapsule: {
        backgroundColor: COLORS.primary,
        paddingVertical: vs(8),
        paddingHorizontal: hs(20),
        borderRadius: ms(8)
    },
    monthText: {
        ...FONTS.bold,
        color: COLORS.white,
        fontSize: ms(14)
    },

    calendarContainer: {
        marginBottom: vs(24)
    },
    row: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: vs(12)
    },
    dayLabel: {
        width: "14.28%",
        textAlign: "center",
        ...FONTS.regular,
        fontSize: ms(12),
        color: COLORS.gray900
    },
    datesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%"
    },
    dateCell: {
        width: "14.28%",
        height: ms(40),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: vs(4),
        borderRadius: ms(8)
    },
    dateCellSelected: {
        backgroundColor: COLORS.primary
    },
    dateText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.black
    },
    dateTextDisabled: {
        color: COLORS.gray900
    },
    dateTextSelected: {
        color: COLORS.white,
        ...FONTS.bold
    },
    timeSection: {
        marginBottom: vs(32)
    },
    sectionTitle: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.black,
        marginBottom: vs(12)
    },
    timeOptions: {
        flexDirection: "row",
        gap: hs(12)
    },
    timeChip: {
        paddingVertical: vs(10),
        paddingHorizontal: hs(24),
        borderRadius: ms(20),
        backgroundColor: COLORS.gray100,
        borderWidth: 1,
        borderColor: "transparent"
    },
    timeChipSelected: {
        backgroundColor: COLORS.primary
    },
    timeText: {
        ...FONTS.regular,
        fontSize: ms(14),
        color: COLORS.gray900
    },
    timeTextSelected: {
        color: COLORS.white,
        ...FONTS.bold
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: ms(12),
        paddingVertical: vs(14),
        alignItems: "center"
    },
    saveButtonText: {
        ...FONTS.bold,
        fontSize: ms(16),
        color: COLORS.white
    }
});

export default ScheduleRecipeSheetContent;
