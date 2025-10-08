import { HabitProgress } from "@/types/interfaces";
import { db } from '@/utils/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";


// add an HabitProgress
// PS: Habit is a subcollection of group
// PS: HabitProgess is a subcollection of group
export const addHabitProgress = async (
    groupId: string,
    habitProgressData : HabitProgress
) => {
    try {
        const habitProgressRef = collection(db, "groups", groupId, "habitProgress");
        await addDoc(habitProgressRef, habitProgressData);
        return { success: true, error: null};
    } catch (error) {
        console.error("Error adding habit progress:", error);
        return { success: false, error: error};
    }
}

// get habitProgress of a group to show on the calendar
export const getGroupHabitProgress = async (groupId: string) => {
  try {
    const habitProgressRef = collection(db, "groups", groupId, "habitProgress");
    const querySnapshot = await getDocs(habitProgressRef);
    const habitProgresses = querySnapshot.docs.map((doc) => doc.data());
    return { success: true, data: habitProgresses, error: null};
  } catch (error) {
    console.error("Error getting group habit progress:", error);
    return { success: false, data: [], error: error};
  }
}
// update an HabitProgress
export const updateHabitProgress = async (groupId: string, habitProgressData: HabitProgress) => {
  try {
    if (!habitProgressData.id) {
        throw new Error("HabitProgress id is required for update.");
    }
    const habitProgressDocRef = doc(db, "groups", groupId, "habitProgress", habitProgressData.id);
    await updateDoc(habitProgressDocRef, {
        completed: habitProgressData.completed,
        feeling: habitProgressData.feeling,
        comment: habitProgressData.comment,
    });
    return { success: true, error: null};
  } catch (error) {
    console.error("Error updating habit progress:", error);
    return { success: false, error: error};
  }
}

// delete an HabitProgress
export const deleteHabitProgress = async (groupId: string, habitProgressId: string) => {
  try {
    const habitProgressDocRef = doc(db, "groups", groupId, "habitProgress", habitProgressId);
    await deleteDoc(habitProgressDocRef);
    return { success: true, error: null};
  } catch (error) {
    console.error("Error deleting habit progress:", error);
    return { success: false, error: error};
  }
}
