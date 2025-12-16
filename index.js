/**
 * @format
 */

import { AppRegistry, LogBox } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

LogBox.ignoreLogs([
    "This method is deprecated",
    "Please use `getApp()` instead",
    "Please use `onAuthStateChanged()` instead"
]);

AppRegistry.registerComponent(appName, () => App);
