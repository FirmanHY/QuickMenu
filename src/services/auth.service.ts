import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

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

        await firestore().collection("users").doc(user.uid).set(userData);

        return user;
    } catch (error: any) {
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
        throw error;
    }
};

export const signOut = async () => {
    try {
        await auth().signOut();
    } catch (error) {
        console.error(error);
    }
};

export const getUserProfile = async (uid: string) => {
    const doc = await firestore().collection("users").doc(uid).get();
    return doc.exists ? (doc.data() as UserData) : null;
};
