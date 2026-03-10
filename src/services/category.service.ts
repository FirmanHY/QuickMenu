// services/category.service.ts
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

export interface Category {
    id: string;
    name: string;
    displayName: string;
    icon?: string;
    color?: string;
    order?: number;
    isDefault?: boolean;
    userId?: string;
    createdAt: number;
}

// ==================== DEFAULT CATEGORIES ====================

// Get all default categories
export const getDefaultCategories = async (): Promise<Category[]> => {
    try {
        // RTDB: ambil semua dari path categories/, lalu sort by order
        const snapshot = await database()
            .ref("categories")
            .orderByChild("order")
            .once("value");

        const categories: Category[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                categories.push({
                    id: child.key!,
                    ...child.val()
                });
                return undefined;
            });
        }

        return categories;
    } catch (error) {
        console.error("Error getting default categories:", error);
        throw error;
    }
};

// ==================== USER CUSTOM CATEGORIES ====================

// Create user's custom category
export const createUserCategory = async (
    name: string,
    displayName: string,
    color?: string
): Promise<Category> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        const id = name.toLowerCase().replace(/\s+/g, "-");

        const categoryData = {
            id,
            name,
            displayName,
            color: color || "#70B9BE",
            isDefault: false,
            userId: currentUser.uid,
            createdAt: Date.now()
        };

        // RTDB: simpan di path user_categories/{uid}/{categoryId}
        await database()
            .ref(`user_categories/${currentUser.uid}/${id}`)
            .set(categoryData);

        return categoryData;
    } catch (error) {
        console.error("Error creating user category:", error);
        throw error;
    }
};

// Get user's custom categories
export const getUserCategories = async (): Promise<Category[]> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: ambil semua dari path user_categories/{uid}
        const snapshot = await database()
            .ref(`user_categories/${currentUser.uid}`)
            .orderByChild("createdAt")
            .once("value");

        const categories: Category[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                categories.push({
                    id: child.key!,
                    ...child.val()
                });
                return undefined;
            });
        }

        // Reverse supaya yang terbaru di atas (orderByChild ascending)
        categories.reverse();

        return categories;
    } catch (error) {
        console.error("Error getting user categories:", error);
        throw error;
    }
};

// Get all categories (default + user custom)
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const [defaultCategories, userCategories] = await Promise.all([
            getDefaultCategories(),
            getUserCategories()
        ]);

        return [...defaultCategories, ...userCategories];
    } catch (error) {
        console.error("Error getting all categories:", error);
        throw error;
    }
};

// Delete user's custom category
export const deleteUserCategory = async (categoryId: string): Promise<void> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: hapus dengan remove()
        await database()
            .ref(`user_categories/${currentUser.uid}/${categoryId}`)
            .remove();
    } catch (error) {
        console.error("Error deleting user category:", error);
        throw error;
    }
};

// Update user's custom category
export const updateUserCategory = async (
    categoryId: string,
    data: Partial<Pick<Category, "displayName" | "color">>
): Promise<void> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("User tidak terautentikasi");
        }

        // RTDB: update partial data
        await database()
            .ref(`user_categories/${currentUser.uid}/${categoryId}`)
            .update(data);
    } catch (error) {
        console.error("Error updating user category:", error);
        throw error;
    }
};