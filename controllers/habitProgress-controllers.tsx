import { HabitProgress } from "@/types/interfaces";
import { db } from '@/utils/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

// Add habit progress to a specific habit's progresses subcollection
export const addHabitProgress = async (
    groupId: string,
    habitId: string,
    habitProgressData: HabitProgress
) => {
    try {
        const habitProgressRef = collection(db, "groups", groupId, "habits", habitId, "progresses");
        await addDoc(habitProgressRef, habitProgressData);
        return { success: true, error: null};
    } catch (error) {
        console.error("Error adding habit progress:", error);
        return { success: false, error: error};
    }
}

// Get habit progress for a specific habit
export const getHabitProgress = async (groupId: string, habitId: string) => {
  try {
    const habitProgressRef = collection(db, "groups", groupId, "habits", habitId, "progresses");
    const querySnapshot = await getDocs(habitProgressRef);
    const habitProgresses = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: habitProgresses, error: null};
  } catch (error) {
    console.error("Error getting habit progress:", error);
    return { success: false, data: [], error: error};
  }
}

// Get all habit progress for a group (all habits combined)
export const getGroupHabitProgress = async (groupId: string) => {
  try {
    // First get all habits in the group
    const habitsRef = collection(db, "groups", groupId, "habits");
    const habitsSnapshot = await getDocs(habitsRef);
    
    const allProgresses: any[] = [];
    
    // For each habit, get its progress
    for (const habitDoc of habitsSnapshot.docs) {
      const progressRef = collection(db, "groups", groupId, "habits", habitDoc.id, "progresses");
      const progressSnapshot = await getDocs(progressRef);
      
      progressSnapshot.docs.forEach(progressDoc => {
        allProgresses.push({
          id: progressDoc.id,
          habitId: habitDoc.id,
          ...progressDoc.data()
        });
      });
    }
    
    return { success: true, data: allProgresses, error: null};
  } catch (error) {
    console.error("Error getting group habit progress:", error);
    return { success: false, data: [], error: error};
  }
}
// Update habit progress for a specific habit
export const updateHabitProgress = async (groupId: string, habitId: string, habitProgressData: HabitProgress) => {
  try {
    if (!habitProgressData.id) {
        throw new Error("HabitProgress id is required for update.");
    }
    const habitProgressDocRef = doc(db, "groups", groupId, "habits", habitId, "progresses", habitProgressData.id);
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

// Delete habit progress for a specific habit
export const deleteHabitProgress = async (groupId: string, habitId: string, habitProgressId: string) => {
  try {
    const habitProgressDocRef = doc(db, "groups", groupId, "habits", habitId, "progresses", habitProgressId);
    await deleteDoc(habitProgressDocRef);
    return { success: true, error: null};
  } catch (error) {
    console.error("Error deleting habit progress:", error);
    return { success: false, error: error};
  }
}

// Get habit progress for a specific date and user
export const getHabitProgressByDate = async (groupId: string, habitId: string, date: string, userId: string) => {
  try {
    const habitProgressRef = collection(db, "habits", habitId, "progresses");
    const q = query(habitProgressRef, 
      where("date", "==", date),
      where("userId", "==", userId)
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
        userId: progressData.userId,
        date: progressData.date,
        completed: progressData.completed,
        feeling: progressData.feeling,
        comment: progressData.comment
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error getting habit progress by date:", error);
    return { success: false, data: null, error: error };
  }
}
