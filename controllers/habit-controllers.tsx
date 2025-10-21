import { Category, Habit } from '@/types/interfaces';
import { db } from '@/utils/firebase';
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { updateUserGH } from './group-controllers.tsx';

// -GET -
// get Group's habits
export const getGroupsHabits = async (groupId: string) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const habitRef = collection(groupRef, "habits");
    const querySnapshot = await getDocs(habitRef);
    const habits = querySnapshot.docs.map((doc) => doc.data());
    return { success: true, data: habits, error: null};
  } catch (error) {
    console.error("Error getting group's habits:", error);
    return { success: false, data: [], error: error};
  }
}

// -POST -
//create habit and link it to a group
export const createHabit = async (
  groupId: string,
  habitData: Partial<Habit>,
  memberIds: string[]
) => {
  try {
    const habitRef = collection(db, "habits");

    const docRef = await addDoc(habitRef, habitData);
    console.log(`New habit '${habitData.name}' added to group '${groupId}' with ID:`, docRef.id);
    
    // add habit ID to the group's habits array field
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      habits: arrayUnion(docRef.id)
    });
    console.log(`Habit '${habitData.name}' linked to group '${groupId}'`);
    // add habit ID to each member's habits array field
    await Promise.all(
      memberIds.map(memberId => updateUserGH(memberId, { habits: [docRef.id] }))
    );

    return { success: true, error: null, id: docRef.id };

  } catch (error) {
    console.error("Error adding habit to group:", error);
    return { success: false, error: error, id: null };
  }
}

// -PUT -
//update habit
export const updateHabit = async (
  groupId: string, 
  habitId: string, 
  habitData: {
    name: string,
    description: string,
    startDate: Date;
    endDate: Date;
    frequency: string;
    category: Pick<Category, 'value'>;
}) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const habitRef = collection(groupRef, "habits");
    const habitDoc = doc(habitRef, habitId);
    await setDoc(habitDoc, habitData);
    console.log(`Habit '${habitData.name}' updated successfully`);
    return { success: true, error: null};
  } catch (error) {
    console.error("Error updating habit:", error);
    return { success: false, error: error};
  }
}

//delete habit
export const deleteHabit = async (
  groupId: string, 
  habitId: string
) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const habitRef = collection(groupRef, "habits");
    const habitDoc = doc(habitRef, habitId);
    await deleteDoc(habitDoc);
    console.log(`Habit '${habitId}' deleted successfully`);
    return { success: true, error: null};
  } catch (error) {
    console.error("Error deleting habit:", error);
    return { success: false, error: error};
  }
};

// this function adds a habit ID to the habits array field of a user document
export const addHabitToUser = async ( userId: string, habitId: string ) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      habits: arrayUnion(habitId)
    });
    console.log(`Habit '${habitId}' added to user '${userId}'`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding habit to user:", error);
    return { success: false, error: error };
  }
};
//--------------------------------------------------
// this function retrieve list of user habit IDs that are programmed (depending on the frequency) on a specific date for a user
export const getHabitsScheduledForDate = async (
  habitIds: string[],
  date: Date
) => {
  // helper: check if habit is scheduled on given date
  const isHabitScheduled = (habit: any, date: Date): boolean => {
    const { frequency } = habit;
    if (!frequency) return false;
  
    const target = new Date(date);
  
    switch (frequency.type) {
      case "EveryDay":
        return true;
  
      case "Custom":
      case "WorkDays":
        // e.g. days = [1,3,5] → Mon, Wed, Fri
        return frequency.days.includes(target.getDay());
  
      default:
        return false;
    }
  };
  const activeHabitIds: string[] = [];
  const activeGroupIds: string[] = [];

  for (const habitId of habitIds) {
    const habitRef = doc(db, "habits", habitId);
    const habitSnap = await getDoc(habitRef);

    if (!habitSnap.exists()) continue;

    const habitData = habitSnap.data();

    if (isHabitScheduled(habitData, date)) {
      activeHabitIds.push(habitId);
      activeGroupIds.push(habitData.groupId);
    }
  }

  return { activeHabitIds, activeGroupIds };
};
//--------------------------------------------
