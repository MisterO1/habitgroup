import { Group, HabitProgress } from "@/types/interfaces";
import { db } from '@/utils/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { createGroupProgress, updateGroupProgress } from "./group-progress-controllers";

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
export const createHabitProgress = async ( habitId: string, habitProgressData: HabitProgress, group: Group) => {
  try {

    const docId = `${habitProgressData.date.replace(/-/g, '')}_${habitProgressData.userId}`; // YYYYMMDD_userId
    const habitProgressRef = doc(db, "habits", habitId, "progresses", docId );
    await setDoc(habitProgressRef, habitProgressData);

    // update groupProgress for this habit on that date
    const groupId = group.id
    const gpref = collection(db, "groups", habitId, "progresses")
    const gq = query(gpref, where("date", "==", habitProgressData.date))
    const gquerySnapshot = await getDocs(gq)

    if (gquerySnapshot.empty){  // means the user is first one to push an habitProgress that day. so let's create the groupProgress
      await createGroupProgress(groupId, {
        date: habitProgressData.date,
        habitId,
        completionRate: ( habitProgressData.completed ? 1 : 0 ) / group.members.length,
      })
    } else { // means to update the completionRate with the one
      const hpref = collection(db, "habits", habitId, "progresses")
      const hq = query(hpref, where("date", "==", habitProgressData.date))
      const hquerySnapshot = await getDocs(hq)
      const habitProgressfiltered = hquerySnapshot.docs.filter( hp => hp.data().completed )
      const newCompletionRate = habitProgressfiltered.length / group.members.length
      await updateGroupProgress(
        groupId,
        habitProgressData.date,
        newCompletionRate,
      )
    }    

    return { success: true, id: docId, error: null };

  } catch (error) {

    console.error("Error creating habit progress:", error);
    return { success: false, id: null, error: error };
  }
};

// Update habit progress for a specific habit
export const updateHabitProgress = async (habitId: string, habitProgressData: HabitProgress, group: Group) => {
  try {

    if (!habitProgressData.id) {
        throw new Error("HabitProgress id is required for update.");
    }
    const habitProgressDocRef = doc(db, "habits", habitId, "progresses", habitProgressData.id);
    await updateDoc(habitProgressDocRef, {
        completed: habitProgressData.completed || false,
        feeling: habitProgressData.feeling || '',
        comment: habitProgressData.comment || '',
    });

    // update GroupProgress
    const hpref = collection(db, "habits", habitId, "progresses")
    const q = query(hpref, where("date", "==", habitProgressData.date))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty){  // means the user is first one to push an habitProgress that day. so let's create the groupProgress
      await createGroupProgress(group.id, {
        date: habitProgressData.date,
        habitId,
        completionRate: ( habitProgressData.completed ? 1 : 0 ) / group.members.length,
      })
    } else { // means to update the completionRate with the one
      const habitProgressfiltered = querySnapshot.docs.filter( hp => hp.data().completed )
      const newCompletionRate = habitProgressfiltered.length / group.members.length
      await updateGroupProgress(
        group.id,
        habitProgressData.date,
        newCompletionRate,
      )
    } 

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


