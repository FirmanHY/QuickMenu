import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

// Tipe data yang disimpan di slot (snapshot ringkas dari resep)
export interface MealPlanItem {
    recipeId: string;
    title: string;
    imageUrl?: string;
}

// Tipe data dokumen per hari
export interface DailyPlanDocument {
    date: string; // Format YYYY-MM-DD (sebagai key juga)
    timestamp: number;
    breakfast?: MealPlanItem | null;
    lunch?: MealPlanItem | null;
    dinner?: MealPlanItem | null;
}

// Helper untuk dapatkan User ID
const getUserId = () => {
    const user = auth().currentUser;
    if (!user) throw new Error("User tidak terautentikasi");
    return user.uid;
};

// 1. TAMBAH / EDIT Rencana Makan
export const saveMealPlan = async (
    date: string, // "2023-11-15"
    type: "breakfast" | "lunch" | "dinner",
    mealData: MealPlanItem
): Promise<void> => {
    try {
        const uid = getUserId();

        // RTDB: update partial data (mirip Firestore merge)
        await database()
            .ref(`user_meal_plans/${uid}/${date}`)
            .update({
                date,
                timestamp: new Date(date).getTime(),
                [type]: mealData // Dynamic key update
            });
    } catch (error) {
        console.error("Error saving meal plan:", error);
        throw error;
    }
};

// 2. HAPUS Rencana Makan
export const removeMealPlan = async (
    date: string,
    type: "breakfast" | "lunch" | "dinner"
): Promise<void> => {
    try {
        const uid = getUserId();

        // RTDB: set null untuk hapus field tertentu
        await database()
            .ref(`user_meal_plans/${uid}/${date}/${type}`)
            .remove();
    } catch (error) {
        console.error("Error removing meal plan:", error);
        throw error;
    }
};

// 3. AMBIL DATA MINGGUAN (Range Query)
export const getWeeklyMealPlans = async (
    startDate: string,
    endDate: string
): Promise<DailyPlanDocument[]> => {
    try {
        const uid = getUserId();

        // RTDB: range query pakai orderByChild + startAt/endAt
        // Karena date key = "YYYY-MM-DD" (sortable string), kita bisa pakai orderByKey
        const snapshot = await database()
            .ref(`user_meal_plans/${uid}`)
            .orderByKey()
            .startAt(startDate)
            .endAt(endDate)
            .once("value");

        const plans: DailyPlanDocument[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                plans.push(child.val() as DailyPlanDocument);
                return undefined;
            });
        }

        return plans;
    } catch (error) {
        console.error("Error getting weekly plans:", error);
        return [];
    }
};

// 4. AMBIL DATA HARIAN
export const getDailyPlan = async (
    dateKey: string
): Promise<DailyPlanDocument | null> => {
    try {
        const uid = getUserId();

        // RTDB: ambil langsung dari path
        const snapshot = await database()
            .ref(`user_meal_plans/${uid}/${dateKey}`)
            .once("value");

        if (snapshot.exists()) {
            return snapshot.val() as DailyPlanDocument;
        }
        return null;
    } catch (error) {
        console.error("Error getting daily plan:", error);
        return null;
    }
};