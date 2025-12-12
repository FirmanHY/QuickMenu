import { TextStyle } from "react-native";

type FontStyle = Pick<TextStyle, "fontFamily" | "fontWeight">;

export const FONTS = {
    regular: {
        fontFamily: "NunitoSans-Regular",
        fontWeight: "400"
    } as FontStyle,

    semiBold: {
        fontFamily: "NunitoSans-SemiBold",
        fontWeight: "600"
    } as FontStyle,

    bold: {
        fontFamily: "NunitoSans-Bold",
        fontWeight: "700"
    } as FontStyle
} as const;
