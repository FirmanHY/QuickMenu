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

        await database().ref(`users/${user.uid}`).set(userData);

        // ✅ Kirim email verifikasi setelah register
        await user.sendEmailVerification();

        // Sign out dulu supaya user tidak langsung masuk sebelum verifikasi
        await auth().signOut();

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
        const user = userCredential.user;

        // ✅ Blokir login jika email belum diverifikasi
        if (!user.emailVerified) {
            await auth().signOut(); // Paksa keluar
            const error: any = new Error("Email belum diverifikasi.");
            error.code = "auth/email-not-verified";
            throw error;
        }

        return user;
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
        const snapshot = await database().ref(`users/${uid}`).once("value");
        return snapshot.val();
    } catch (error) {
        console.error("Get User Profile Error:", error);
        throw error;
    }
};