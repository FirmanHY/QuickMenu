import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import {
    uploadImageToCloudinary,
    deleteImageFromCloudinary
} from "./cloudinary.service";
import { ImagePickerResponse } from "react-native-image-picker";

export interface Recipe {
    id: string;
    userId?: string;
    title: string;
    duration: string;
    ingredients: string;
    steps: string;
    imageUrl: string | undefined;
    imagePublicId?: string;
    categories: string[];
    source:
        | "QuickMenu"
        | "Manual"
        | "Instagram"
        | "TikTok"
        | "Youtube"
        | "Web"
        | string;
    isBookmarked?: boolean;
    createdAt: number;
    updatedAt?: number;
    createdBy?: string;
}

export interface CreateRecipeData {
    title: string;
    duration: string;
    ingredients: string;
    steps: string;
    imageUri: ImagePickerResponse | null;
    categories: string[];
    source?: string;
    originalUrl?: string;
}

// ==================== USER CUSTOM RECIPES ====================

// Create user's custom recipe
export const createUserRecipe = async (
    data: CreateRecipeData
): Promise<Recipe> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        let imageUrl: string | undefined;
        let imagePublicId: string | undefined;

        // Upload image ke Cloudinary kalau ada
        if (data.imageUri) {
            const uploadResult = await uploadImageToCloudinary(
                data.imageUri,
                `user_recipes/${currentUser.uid}`
            );
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        // RTDB: generate key baru pakai push()
        const newRef = database()
            .ref(`user_recipes/${currentUser.uid}`)
            .push();

        const recipeData: Omit<Recipe, "id" | "isBookmarked"> = {
            userId: currentUser.uid,
            title: data.title,
            duration: data.duration,
            ingredients: data.ingredients,
            steps: data.steps,
            imageUrl,
            imagePublicId,
            categories: data.categories,
            source: data.source || "Manual",
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await newRef.set(recipeData);

        return {
            id: newRef.key!,
            ...recipeData,
            isBookmarked: false
        };
    } catch (error) {
        console.error("Error creating user recipe:", error);
        throw error;
    }
};

// Get user's custom recipes
export const getUserCustomRecipes = async (): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: ambil semua recipes milik user dari path user_recipes/{uid}
        const snapshot = await database()
            .ref(`user_recipes/${currentUser.uid}`)
            .orderByChild("createdAt")
            .once("value");

        const recipes: Recipe[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                recipes.push({
                    id: child.key!,
                    ...child.val(),
                    isBookmarked: false
                });
                return undefined; // RTDB forEach butuh return
            });
        }

        // Sort descending (RTDB orderByChild ascending by default)
        recipes.reverse();

        return recipes;
    } catch (error) {
        console.error("Error getting user custom recipes:", error);
        throw error;
    }
};

// Get user's custom recipes by category
export const getUserRecipesByCategory = async (
    categoryId: string
): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: tidak support array-contains, jadi fetch semua lalu filter client-side
        const snapshot = await database()
            .ref(`user_recipes/${currentUser.uid}`)
            .orderByChild("createdAt")
            .once("value");

        const recipes: Recipe[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const data = child.val();
                // Filter: cek apakah categories array mengandung categoryId
                if (
                    data.categories &&
                    Array.isArray(data.categories) &&
                    data.categories.includes(categoryId)
                ) {
                    recipes.push({
                        id: child.key!,
                        ...data,
                        isBookmarked: false
                    });
                }
                return undefined;
            });
        }

        // Sort descending
        recipes.reverse();

        return recipes;
    } catch (error) {
        console.error("Error getting recipes by category:", error);
        throw error;
    }
};

// Update user's custom recipe
export const updateUserRecipe = async (
    recipeId: string,
    data: Partial<CreateRecipeData>
): Promise<void> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        const updateData: any = {
            ...data,
            updatedAt: Date.now()
        };

        // Upload image baru kalau ada
        if (data.imageUri) {
            const uploadResult = await uploadImageToCloudinary(
                data.imageUri,
                `user_recipes/${currentUser.uid}`
            );
            updateData.imageUrl = uploadResult.secure_url;
            updateData.imagePublicId = uploadResult.public_id;
            delete updateData.imageUri;
        }

        // RTDB: update di path user_recipes/{uid}/{recipeId}
        await database()
            .ref(`user_recipes/${currentUser.uid}/${recipeId}`)
            .update(updateData);
    } catch (error) {
        console.error("Error updating user recipe:", error);
        throw error;
    }
};

// Delete user's custom recipe
export const deleteUserRecipe = async (recipeId: string): Promise<void> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: ambil data dulu untuk cek imagePublicId
        const snapshot = await database()
            .ref(`user_recipes/${currentUser.uid}/${recipeId}`)
            .once("value");

        if (!snapshot.exists()) {
            throw new Error("Resep tidak ditemukan");
        }

        const recipe = snapshot.val() as Recipe;

        // Hapus image dari Cloudinary kalau ada
        if (recipe.imagePublicId) {
            await deleteImageFromCloudinary(recipe.imagePublicId);
        }

        // RTDB: hapus dengan set null atau remove()
        await database()
            .ref(`user_recipes/${currentUser.uid}/${recipeId}`)
            .remove();
    } catch (error) {
        console.error("Error deleting user recipe:", error);
        throw error;
    }
};

// ==================== QUICKMENU RECIPES ====================

// Get all QuickMenu public recipes
export const getQuickMenuRecipes = async (): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: ambil semua public recipes
        const snapshot = await database()
            .ref("recipes")
            .orderByChild("createdAt")
            .once("value");

        // Ambil bookmarks user
        const bookmarksSnapshot = await database()
            .ref(`user_bookmarks/${currentUser.uid}`)
            .once("value");

        const bookmarkedIds = new Set<string>();
        if (bookmarksSnapshot.exists()) {
            bookmarksSnapshot.forEach((child) => {
                bookmarkedIds.add(child.val().recipeId);
                return undefined;
            });
        }

        const recipes: Recipe[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                recipes.push({
                    id: child.key!,
                    ...child.val(),
                    isBookmarked: bookmarkedIds.has(child.key!)
                });
                return undefined;
            });
        }

        // Sort descending
        recipes.reverse();

        return recipes;
    } catch (error) {
        console.error("Error getting QuickMenu recipes:", error);
        throw error;
    }
};

// Get bookmarked QuickMenu recipes
export const getBookmarkedRecipes = async (): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: ambil semua bookmarks user
        const bookmarksSnapshot = await database()
            .ref(`user_bookmarks/${currentUser.uid}`)
            .orderByChild("bookmarkedAt")
            .once("value");

        const recipeIds: string[] = [];
        if (bookmarksSnapshot.exists()) {
            bookmarksSnapshot.forEach((child) => {
                recipeIds.push(child.val().recipeId);
                return undefined;
            });
        }

        // Reverse supaya yang terbaru di atas
        recipeIds.reverse();

        if (recipeIds.length === 0) {
            return [];
        }

        // RTDB: tidak support "in" query, jadi fetch satu-satu
        const recipes: Recipe[] = [];

        for (const recipeId of recipeIds) {
            const recipeSnapshot = await database()
                .ref(`recipes/${recipeId}`)
                .once("value");

            if (recipeSnapshot.exists()) {
                recipes.push({
                    id: recipeSnapshot.key!,
                    ...recipeSnapshot.val(),
                    isBookmarked: true
                });
            }
        }

        return recipes;
    } catch (error) {
        console.error("Error getting bookmarked recipes:", error);
        throw error;
    }
};

// Get healthy recipes (untuk home screen)
export const getHealthyRecipes = async (): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("User tidak terautentikasi");

        // RTDB: tidak support array-contains, fetch semua lalu filter client-side
        const snapshot = await database()
            .ref("recipes")
            .once("value");

        // Ambil bookmarks
        const bookmarksSnapshot = await database()
            .ref(`user_bookmarks/${currentUser.uid}`)
            .once("value");

        const bookmarkedIds = new Set<string>();
        if (bookmarksSnapshot.exists()) {
            bookmarksSnapshot.forEach((child) => {
                bookmarkedIds.add(child.val().recipeId);
                return undefined;
            });
        }

        const recipes: Recipe[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const data = child.val();
                // Filter: hanya yang punya category "healthy"
                if (
                    data.categories &&
                    Array.isArray(data.categories) &&
                    data.categories.includes("healthy")
                ) {
                    recipes.push({
                        id: child.key!,
                        ...data,
                        isBookmarked: bookmarkedIds.has(child.key!)
                    });
                }
                return undefined;
            });
        }

        // Limit 10
        return recipes.slice(0, 10);
    } catch (error) {
        console.error("Error getting healthy recipes:", error);
        return [];
    }
};

// Toggle bookmark
export const toggleBookmark = async (
    recipeId: string,
    shouldBookmark: boolean
): Promise<void> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("User tidak terautentikasi");

        const bookmarkRef = database()
            .ref(`user_bookmarks/${currentUser.uid}/${recipeId}`);

        if (shouldBookmark) {
            await bookmarkRef.set({
                recipeId,
                bookmarkedAt: Date.now()
            });
        } else {
            // RTDB: hapus dengan remove()
            await bookmarkRef.remove();
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        throw error;
    }
};

// ==================== RECIPE DETAIL ====================

// Get recipe detail (cek user_recipes dulu, lalu public recipes)
export const getRecipeDetail = async (
    recipeId: string
): Promise<Recipe | null> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("User tidak terautentikasi");

        // Cek bookmark status
        const bookmarkSnapshot = await database()
            .ref(`user_bookmarks/${currentUser.uid}/${recipeId}`)
            .once("value");

        const isRealTimeBookmarked = bookmarkSnapshot.exists();

        // 1. Cek di user_recipes (Custom/Imported/Edited)
        const userRecipeSnapshot = await database()
            .ref(`user_recipes/${currentUser.uid}/${recipeId}`)
            .once("value");

        if (userRecipeSnapshot.exists()) {
            const data = userRecipeSnapshot.val();
            return {
                id: userRecipeSnapshot.key!,
                ...data,
                source: data?.source || "Manual",
                isBookmarked: isRealTimeBookmarked
            } as Recipe;
        }

        // 2. Cek di public recipes
        const publicSnapshot = await database()
            .ref(`recipes/${recipeId}`)
            .once("value");

        if (publicSnapshot.exists()) {
            return {
                id: publicSnapshot.key!,
                ...publicSnapshot.val(),
                source: "QuickMenu",
                isBookmarked: isRealTimeBookmarked
            } as Recipe;
        }

        return null;
    } catch (error) {
        console.error("Error getting recipe details:", error);
        throw error;
    }
};

// ==================== COMBINED COLLECTIONS ====================

// Get all user's recipes (custom + bookmarked QuickMenu recipes)
export const getAllUserRecipes = async (): Promise<Recipe[]> => {
    try {
        const [customRecipes, bookmarkedRecipes] = await Promise.all([
            getUserCustomRecipes(),
            getBookmarkedRecipes()
        ]);

        const allRecipes = [...customRecipes, ...bookmarkedRecipes];
        allRecipes.sort((a, b) => {
            const aTime = a.updatedAt || a.createdAt;
            const bTime = b.updatedAt || b.createdAt;
            return bTime - aTime;
        });

        return allRecipes;
    } catch (error) {
        console.error("Error getting all user recipes:", error);
        throw error;
    }
};