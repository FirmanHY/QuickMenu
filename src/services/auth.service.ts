import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

export interface UserData {
    uid: string;
    fullName: string;
    email: string;
    createdAt: number;
}

export const signUp = async (email: string, pass: string, fullName: string) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(
            email,
            pass
        );
        const user = userCredential.user;

        const userData: UserData = {
            uid: user.uid,
            email: user.email || email,
            fullName: fullName,
            createdAt: Date.now()
        };

        // RTDB: set data langsung di path users/{uid}
        await database()
            .ref(`users/${user.uid}`)
            .set(userData);

        return user;
    } catch (error: any) {
        console.error("SignUp Error:", error);
        throw error;
    }
};

export const signIn = async (email: string, pass: string) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(
            email,
            pass
        );
        return userCredential.user;
    } catch (error: any) {
        console.error("SignIn Error:", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await auth().signOut();
    } catch (error) {
        console.error("SignOut Error:", error);
        throw error;
    }
};

export const getUserProfile = async (uid: string) => {
    try {
        // RTDB: ambil data dari path users/{uid}
        const snapshot = await database()
            .ref(`users/${uid}`)
            .once("value");

        return snapshot.val();
    } catch (error) {
        console.error("Get User Profile Error:", error);
        throw error;
    }
};