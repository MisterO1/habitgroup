import { HabitProgress } from "@/types/interfaces";
import { db } from '@/utils/firebase';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// habits collection and groups collection are top-level collections and have their own progresses subcollections
// each habit document has its own progresses subcollection to store habit progress for that habit
// each group document has its own progresses subcollection to store Group progress for all habits in that group

// Get habit progress for a specific date and user
export const getHabitProgressByDate = async (habitId: string, date: string, userId: string) => {
  try {

    const docId = `${date.replace(/-/g, '')}_${userId}`;
    const habitProgressRef = doc(db, "habits", habitId, "progresses", docId);
    const progressDoc = await getDoc(habitProgressRef);
    
    if (!progressDoc.exists()) {
      return { success: true, data: null, error: null };
    }
    
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

// create a new document in the "progresses" subcollection of a specific habit
export const createHabitProgress = async ( habitId: string, habitProgressData: HabitProgress) => {
  try {

    const docId = `${habitProgressData.date.replace(/-/g, '')}_${habitProgressData.userId}`; // YYYYMMDD_userId
    const habitProgressRef = doc(db, "habits", habitId, "progresses", docId );
    await setDoc(habitProgressRef, habitProgressData);
    return { success: true, id: docId, error: null };

  } catch (error) {

    console.error("Error creating habit progress:", error);
    return { success: false, id: null, error: error };
  }
};

// Get habit progress for a specific habit
// export const getHabitProgress = async (habitId: string) => {
//   try {

//     const habitProgressRef = collection(db, "habits", habitId, "progresses");
//     const querySnapshot = await getDocs(habitProgressRef);
//     const habitProgresses = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return { success: true, data: habitProgresses, error: null};

//   } catch (error) {

//     console.error("Error getting habit progress:", error);
//     return { success: false, data: [], error: error};
//   }
// }

// Get all progress for a group

// Update habit progress for a specific habit
export const updateHabitProgress = async (habitId: string, habitProgressData: HabitProgress) => {
  try {

    if (!habitProgressData.id) {
        throw new Error("HabitProgress id is required for update.");
    }
    const habitProgressDocRef = doc(db, "habits", habitId, "progresses", habitProgressData.id);
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
export const deleteHabitProgress = async ( habitId: string, habitProgressId: string) => {
  try {

    const habitProgressDocRef = doc(db, "habits", habitId, "progresses", habitProgressId);
    await deleteDoc(habitProgressDocRef);
    return { success: true, error: null};

  } catch (error) {
    
    console.error("Error deleting habit progress:", error);
    return { success: false, error: error};
  }
}


