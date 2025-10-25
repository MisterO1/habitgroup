import { GroupProgress } from "@/types/interfaces";
import { db } from '@/utils/firebase';
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";

// create a GroupProgress controller file similar to HabitProgress controller file
// each group document has its own progresses subcollection to store Group progress for all habits in that group

// create a new document in the "progresses" subcollection of a specific group
export const createGroupProgress = async ( groupId: string, groupProgressData: GroupProgress) => {
    try {
        const docId = `gp_${groupProgressData.date.replace(/-/g, '')}_${groupProgressData.habitId}`;
        const groupProgressRef = doc(db, "groups", groupId, "progresses", docId);
        const docRef = await setDoc(groupProgressRef, groupProgressData);
        return { success: true, id: docId, error: null };
    } catch (error) {
        console.error("Error creating group progress:", error);
        return { success: false, id: null, error: error };
    }
};

// Update group progress completionRate for a specific group
export const updateGroupProgress = async (groupId: string, date: string, completionRate: number) => {
    try {
        if (!date) {
            throw new Error("Date is required for update.");
        }
        const querySnap = await getDocs(query(collection(db, "groups", groupId, "progresses"), where("date", "==", date)));
        if (querySnap.empty) {
            throw new Error("GroupProgress document not found for the given date.");
        }
        const groupProgressDoc = querySnap.docs[0];
        await updateDoc(groupProgressDoc.ref, {
            completionRate: completionRate,
        });
        return { success: true, error: null };
    } catch (error) {
        console.error("Error updating group progress:", error);
        return { success: false, error: error };
    }
};

// Delete group progress for a specific group
export const deleteGroupProgress = async (groupId: string, groupProgressId: string) => {
    try {
        const groupProgressDocRef = doc(db, "groups", groupId, "progresses", groupProgressId);
        await deleteDoc(groupProgressDocRef);
        return { success: true, error: null };
    } catch (error) {
        console.error("Error deleting group progress:", error);
        return { success: false, error: error };
    }
};

// Get group progress for a specific date
export const getGroupProgressByDate = async (groupId: string, habitId: string, date: string) => {
    try {
        const groupProgressRef = collection(db, "groups", groupId, "progresses");
        const q = query(groupProgressRef,
            where("date", "==", date),
            where("habitId", "==", habitId),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true, data: null, error: null };
        }

        const progressDoc = querySnapshot.docs[0];
        const progressData = progressDoc.data();
        return {
            success: true,
            data: {
                id: progressDoc.id,
                date: progressData.date,
                habitId: progressData.habitId,
                completionRate: progressData.completionRate,
            } as GroupProgress,
            error: null
        };
    } catch (error) {
        console.error("Error getting group progress by date:", error);
        return { success: false, data: null, error: error };
    }
};
