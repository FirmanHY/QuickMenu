import firestore from "@react-native-firebase/firestore";
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

export const createUserRecipe = async (
    data: CreateRecipeData
): Promise<Recipe> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        let imageUrl: string | null = null;
        let imagePublicId: string | null = null;
        if (data.imageUri) {
            const uploadResult = await uploadImageToCloudinary(
                data.imageUri,
                `user_recipes/${currentUser.uid}`
            );
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }


        const recipeData = {
            userId: currentUser.uid,
            title: data.title,
            duration: data.duration,
            ingredients: data.ingredients,
            steps: data.steps,
            imageUrl,
            imagePublicId,
            categories: data.categories || [],
            source: data.source || "Manual",
            originalUrl: data.originalUrl || "",

            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const docRef = await firestore()
            .collection("user_recipes")
            .add(recipeData);

        return {
            id: docRef.id,
            ...recipeData
        } as Recipe;
    } catch (error) {
        console.error("Error creating user recipe:", error);
        throw error;
    }
};

// recipe.service.ts

export const getRecipeById = async (
    recipeId: string
): Promise<Recipe | null> => {
    try {
        const currentUser = auth().currentUser;

      
        let isRealTimeBookmarked = false;
        if (currentUser) {
            const bookmarkRef = firestore()
                .collection("user_bookmarks")
                .doc(currentUser.uid)
                .collection("bookmarks")
                .doc(recipeId);

            const snapshot = await bookmarkRef.get();

            isRealTimeBookmarked = snapshot.data() !== undefined;
        }

        // ---------------------------------------------------------
        // 1. Cek di User Recipes (Custom/Imported/Edited)
        // ---------------------------------------------------------
        try {
            const userDoc = await firestore()
                .collection("user_recipes")
                .doc(recipeId)
                .get();

            if (userDoc.exists) {
                const data = userDoc.data();
                return {
                    id: userDoc.id,
                    ...data,
                    source: data?.source || "Manual",

                   
                    isBookmarked: isRealTimeBookmarked
                } as Recipe;
            }
        } catch (error: any) {
            if (error.code !== "firestore/permission-denied") {
                throw error;
            }
        }

      
        const publicDoc = await firestore()
            .collection("recipes")
            .doc(recipeId)
            .get();

        if (publicDoc.exists) {
            return {
                id: publicDoc.id,
                ...publicDoc.data(),
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


export const getUserCustomRecipes = async (): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        const snapshot = await firestore()
            .collection("user_recipes")
            .where("userId", "==", currentUser.uid)
            .orderBy("createdAt", "desc")
            .get();

        const recipes: Recipe[] = [];
        snapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                isBookmarked: false
            } as Recipe);
        });

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

        const snapshot = await firestore()
            .collection("user_recipes")
            .where("userId", "==", currentUser.uid)
            .where("categories", "array-contains", categoryId)
            .orderBy("createdAt", "desc")
            .get();

        const recipes: Recipe[] = [];
        snapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                isBookmarked: false
            } as Recipe);
        });

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

     
        if (data.imageUri) {
            const uploadResult = await uploadImageToCloudinary(
                data.imageUri,
                `user_recipes/${currentUser.uid}`
            );
            updateData.imageUrl = uploadResult.secure_url;
            updateData.imagePublicId = uploadResult.public_id;
            delete updateData.imageUri;
        }

        await firestore()
            .collection("user_recipes")
            .doc(recipeId)
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

        const doc = await firestore()
            .collection("user_recipes")
            .doc(recipeId)
            .get();

        if (!doc.exists) {
            throw new Error("Resep tidak ditemukan");
        }

        const recipe = doc.data() as Recipe;

  
        if (recipe.imagePublicId) {
            await deleteImageFromCloudinary(recipe.imagePublicId);
        }

   
        await firestore().collection("user_recipes").doc(recipeId).delete();
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

        const snapshot = await firestore()
            .collection("recipes")
            .orderBy("createdAt", "desc")
            .get();

        // Get user's bookmarks
        const bookmarksSnapshot = await firestore()
            .collection("user_bookmarks")
            .doc(currentUser.uid)
            .collection("bookmarks")
            .get();

        const bookmarkedIds = new Set<string>();
        bookmarksSnapshot.forEach((doc) => {
            bookmarkedIds.add(doc.data().recipeId);
        });

        const recipes: Recipe[] = [];
        snapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                isBookmarked: bookmarkedIds.has(doc.id)
            } as Recipe);
        });

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

        // Get user's bookmarks
        const bookmarksSnapshot = await firestore()
            .collection("user_bookmarks")
            .doc(currentUser.uid)
            .collection("bookmarks")
            .orderBy("bookmarkedAt", "desc")
            .get();

        const recipeIds: string[] = [];
        bookmarksSnapshot.forEach((doc) => {
            recipeIds.push(doc.data().recipeId);
        });

        if (recipeIds.length === 0) {
            return [];
        }

        const recipes: Recipe[] = [];
        const batchSize = 10;

        for (let i = 0; i < recipeIds.length; i += batchSize) {
            const batch = recipeIds.slice(i, i + batchSize);
            const snapshot = await firestore()
                .collection("recipes")
                .where(firestore.FieldPath.documentId(), "in", batch)
                .get();

            snapshot.forEach((doc) => {
                recipes.push({
                    id: doc.id,
                    ...doc.data(),
                    isBookmarked: true
                } as Recipe);
            });
        }

        return recipes;
    } catch (error) {
        console.error("Error getting bookmarked recipes:", error);
        throw error;
    }
};


export const getHealthyRecipes = async (): Promise<Recipe[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("User tidak terautentikasi");

        const snapshot = await firestore()
            .collection("recipes")
            .where("categories", "array-contains", "healthy")
            .limit(10) // Batasi 10 aja biar ringan
            .get();


        const bookmarksSnapshot = await firestore()
            .collection("user_bookmarks")
            .doc(currentUser.uid)
            .collection("bookmarks")
            .get();

        const bookmarkedIds = new Set<string>();
        bookmarksSnapshot.forEach((doc) => {
            bookmarkedIds.add(doc.data().recipeId);
        });

        const recipes: Recipe[] = [];
        snapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                isBookmarked: bookmarkedIds.has(doc.id)
            } as Recipe);
        });

        return recipes;
    } catch (error) {
        console.error("Error getting healthy recipes:", error);
    
        return [];
    }
};


export const toggleBookmark = async (
    recipeId: string,
    shouldBookmark: boolean
): Promise<void> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("User tidak terautentikasi");

        const bookmarkRef = firestore()
            .collection("user_bookmarks")
            .doc(currentUser.uid)
            .collection("bookmarks")
            .doc(recipeId);

        if (shouldBookmark) {
            await bookmarkRef.set({
                recipeId,
                bookmarkedAt: Date.now()
            });
        } else {
            await bookmarkRef.delete();
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error);
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
