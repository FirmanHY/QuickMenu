import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { COLORS } from "./src/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const App = (): React.JSX.Element => {
    return (
        <SafeAreaProvider>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.white}
                translucent={false}
            />

            <AppNavigator />
        </SafeAreaProvider>
    );
};

export default App;
