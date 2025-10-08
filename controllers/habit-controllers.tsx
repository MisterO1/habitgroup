import { Category } from '@/types/interfaces';
import { db } from '@/utils/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { getUserGroups } from './group-controllers.tsx';

// -GET -
// get Group's habits
// Ps: habits is a subcollection of groups collection
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

// get all habits of a user
// Ps: habits is a subcollection of groups collection
// Ps: habits is a not subcollection of users collection
// we must pass list habits of all groups of that user
export const getUserHabits = async (userId: string) => {
    try {
      const groups = await getUserGroups(userId);
      const habits: any[] = [];
      if (groups.data && Array.isArray(groups.data)) {
        for (const group of groups.data) {
          const { data } = await getGroupsHabits(group.id);
          if (data && Array.isArray(data)) {
            habits.push(...data);
          }
        }
      }
      return { success: true, data: habits, error: null};
    } catch(error){
    console.error("Error getting user's habits:", error);
    return { success: false, data: [], error: error};
    }
}

// -POST -
//create habit and link it to a group
export const createHabit = async (
  groupId: string,
  habitData: {
    name: string,
    description: string,
    startDate: Date;
    endDate: Date;
    frequency: string;
    category: Pick<Category, 'value'>;
  }
) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const habitRef = collection(groupRef, "habits");

    const docRef = await addDoc(habitRef, { createdAt: new Date(), ...habitData});
    console.log(`New habit '${habitData.name}' added to group '${groupId}' with ID:`, docRef.id);
    return { success: true, error: null};

  } catch (error) {
    console.error("Error adding habit to group:", error);
    return { success: false, error: error};
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

