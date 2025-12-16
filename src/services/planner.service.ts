import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

// Tipe data yang disimpan di slot (snapshot ringkas dari resep)
export interface MealPlanItem {
    recipeId: string;
    title: string;
    imageUrl?: string;
}

// Tipe data dokumen per hari
export interface DailyPlanDocument {
    date: string; // Format YYYY-MM-DD (sebagai ID dokumen juga)
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
        const docRef = firestore()
            .collection("user_meal_plans")
            .doc(uid)
            .collection("plans")
            .doc(date);

    
        await docRef.set(
            {
                date,
                timestamp: new Date(date).getTime(),
                [type]: mealData // Dynamic key update
            },
            { merge: true }
        );
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
        await firestore()
            .collection("user_meal_plans")
            .doc(uid)
            .collection("plans")
            .doc(date)
            .update({
                [type]: firestore.FieldValue.delete() 
            });
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
        const snapshot = await firestore()
            .collection("user_meal_plans")
            .doc(uid)
            .collection("plans")
            .where("date", ">=", startDate)
            .where("date", "<=", endDate)
            .get();

        const plans: DailyPlanDocument[] = [];
        snapshot.forEach((doc) => {
            plans.push(doc.data() as DailyPlanDocument);
        });

        return plans;
    } catch (error) {
        console.error("Error getting weekly plans:", error);
        return [];
    }
};

export const getDailyPlan = async (
    dateKey: string
): Promise<DailyPlanDocument | null> => {
    try {
        const uid = getUserId();
        const doc = await firestore()
            .collection("user_meal_plans")
            .doc(uid)
            .collection("plans")
            .doc(dateKey)
            .get();

        if (doc.exists()) {
            return doc.data() as DailyPlanDocument;
        }
        return null;
    } catch (error) {
        console.error("Error getting daily plan:", error);
        return null;
    }
};
