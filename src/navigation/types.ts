import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    MainApp: undefined;
    AddRecipeManual: undefined;
    RecipeDetail: { recipeId: string };
    EditRecipe: { recipeId: string };
    ImportPreview: { url: string };
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
