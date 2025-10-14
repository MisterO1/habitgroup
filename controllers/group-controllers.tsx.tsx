import { Group, GroupProgress, Habit, SingleGroup } from '@/types/interfaces';
import { db } from '@/utils/firebase';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { Alert } from 'react-native';

const cleanObject = (obj: any) =>
  Object.fromEntries(
  Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
);

// ----------------- READ
//get ALL Groups
export async function getAllGroups() {
  try {
    const querySnapshot = await getDocs(collection(db, "groups"));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
    });
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const error = null
    return { data, error }
  } catch (error) {
    const data = null
    return { data, error }
  }
}

// get single group of a user
export const getSingleGroup = async (singleGroupId:string) => {
  try {
      const singleGroupRef = doc(db, "singleGroups", singleGroupId)
      const querySnap = await getDoc(singleGroupRef)
      if (!querySnap.exists){
        console.log(" No SingleGroup founded with Id :", singleGroupId)
        return {data:null}
      }

      const data = querySnap.data()
      //@ts-ignore
      const dataFormated = { 
        id: data?.id,//@ts-ignore
        // ...data,
        name: data.name ?? "",//@ts-ignore
        description: data.description ?? "",//@ts-ignore
        ownerId: data.ownerId ?? "",
        habits: [],
        createdAt: data?.createdAt ?? null,//@ts-ignore
        private: data.private ?? true,
      } as SingleGroup;
    
    return { data:dataFormated , error:null }
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return { data:null, error }
  }
}

// get all groups of a user
export const getUserGroups = async (groups:string[]) => {
  try {
    // let groupRefs:DocumentReference[] = []
    const groupDocs = await Promise.all(
      groups.map( async (groupId) => {
        const groupRef = doc(db, "groups", groupId)
        const querySnap = await getDoc(groupRef)
        if (!querySnap.exists){
          console.log(" Group not found with groupId :", groupId)
          return null
        }

        const data = querySnap.data()
        const dataFormated = { 
          id: querySnap.id,
          // ...data,
          name: data?.name ?? "",//@ts-ignore
          description: data.description ?? "",//@ts-ignore
          ownerId: data.ownerId ?? "",//@ts-ignore
          habits: data.habits ?? [],
          members: data?.members ?? [],
          createdAt: data?.createdAt ?? null,//@ts-ignore
          private: data?.private ?? false,
        } as Group;

        return dataFormated
      })
    )
    // filter null or not found groups
    const data = groupDocs.filter((g) => g != null)
    
    return { data, error:null }
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return { data:null, error }
  }
}

// get group progress for a specific date
export const getGroupProgress = async (
  groupId: string,
  date: string, // YYYY-MM-DD
) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    const progressesRef = collection(groupRef, "progresses");

    // Search for the document for the given date
    const q = query(progressesRef, where("date", "==", date));
    const snap = await getDocs(q);

    if (snap.empty) return { data:null}; // No score for this day yet

    const docSnap = snap.docs[0]; // Should only be one document per date
    const data = docSnap.data();
    const dataFormated: GroupProgress = {
      id: docSnap.id,
      date: data.date,
      completionRate: data.completionRate,
    }
    return { data:dataFormated, error:null }
  } catch (error) {
    console.log("Error getting group progress: ", error)
    return { data:null, error}
  }  
}

// Calculate and save group progress for a specific date
export const calculateAndSaveGroupProgress = async (
  groupId: string,
  date: string,
  userId: string
) => {
  try {
    // Get all habits in the group
    const groupRef = doc(db, "groups", groupId)
    const habitsRef = collection(groupRef, "habits");
    const habitsSnapshot = await getDocs(habitsRef);
    
    if (habitsSnapshot.empty) {
      return { data: { completionRate: 0 }, error: null };
    }

    let totalHabits = 0;
    let completedHabits = 0;

    // For each habit, check if it's completed for this date
    for (const habitDoc of habitsSnapshot.docs) {
      totalHabits++;
      
      const progressRef = collection(groupRef, "habits", habitDoc.id, "progresses");
      const progressQuery = query(progressRef, 
        where("date", "==", date),
        where("userId", "==", userId)
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      if (!progressSnapshot.empty) {
        const progressData = progressSnapshot.docs[0].data();
        if (progressData.completed) {
          completedHabits++;
        }
      }
    }

    const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;

    // Save or update group progress
    const groupProgressData: GroupProgress = {
      date: date,
      completionRate: completionRate,
    };

    // Check if group progress already exists for this date
    const progressesRef = collection(groupRef, "progresses");
    const existingQuery = query(progressesRef, where("date", "==", date));
    const existingSnapshot = await getDocs(existingQuery);

    if (existingSnapshot.empty) {
      // Create new group progress
      await addDoc(progressesRef, groupProgressData);
    } else {
      // Update existing group progress
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(doc(progressesRef, existingDoc.id), {
        completionRate: completionRate,
      });
    }

    return { data: { completionRate }, error: null };
  } catch (error) {
    console.error("Error calculating group progress:", error);
    return { data: null, error };
  }
}

// all groups that not include the user
export const getUserNotGroups = async (userId: string, _limit = 3) => {
  try {
    const q = query(collection(db, "groups"),orderBy("name","desc"), limit(_limit))
    const querySnapshot = await getDocs(q);
    const filteredGroups: any[] = []
    querySnapshot.forEach((doc) => {
        const groupData = doc.data()
        const members: string[] = []

        if (!members.includes(userId)) {
            filteredGroups.push({ id: doc.id, ...groupData})
        }
        console.log(`${doc.id} =>`, doc.data());
    });
    const data = filteredGroups;
    const error = null
    return { data, error }
  } catch (error) {
    const data = null
    return { data, error }
  }
}

// get all members of a group
export const getGroupMembers = async (groupId: string) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    const querySnapshot = await getDoc(groupRef);
    const groupData = querySnapshot.data()
    if (!groupData || groupData.empty){
      console.log("no group found, so no members founded for groupId :", groupId)
      return { data: null }
    }
    console.log("MembersData", groupData.members)
    const data: string[] = groupData.members
    return { data, error:null }
  } catch (error) {
    console.log("Error getting list of members refs from groupId :", groupId)
    return { data:null, error }
  }
}

//get Group by name
export const getBy = async (ressource: string, field = "name", value='', _limit = 3, userId:string) => {
  try {
    const q = value ? query(collection(db, ressource), where(field,"==",value) ,orderBy(field,"desc"), limit(_limit))
                    : query(collection(db, ressource), limit(_limit))
    const querySnapshot = await getDocs(q);
    // remove User's groups
    const filteredGroups: any[] = []
    querySnapshot.forEach((doc) => {
        const groupData = doc.data()
        const members: string[] = []

        if (!members.includes(userId)) {
            filteredGroups.push({ id: doc.id, ...groupData})
        }
        // console.log(`${doc.id} =>`, doc.data());
    });
    const data = filteredGroups;
    const error = null
    return { data, error }
  } catch (error) {
    const data = null
    return { data, error }
  }
};

//update a user
export const updateUser = async (userId: string, userData: { name?: string, avatar?: string, groups?: string[] }) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, cleanObject(userData));
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error };
  }
};

// ----------------- CREATE
// create Group with Habits (batch)
export const createGroupWithHabits = async (
  userId:string,
  groupData: Partial<Group>,
  habits: Partial<Habit>[],
) => {
  try {

    const batch = writeBatch(db);

    // Create the group document
    const groupRef = doc(collection(db, "groups"));
    let listHabitRefs: string[] = []
    
    // Create habit documents
    habits.forEach(habit => {
      const habitRef = doc(collection(db, "habits"));
      listHabitRefs.push(habitRef.id);
      batch.set(habitRef, cleanObject({
        ...habit,
        groupId: groupRef.id,
        createdAt: new Date().toISOString().split('T')[0],
      }));
      console.log("Habit to create in batch:", habitRef.id, habit.name);
    });

    // console.log("Group data being cleaned:", cleanObject({
    //   habits: listHabitRefs,
    //   createdAt: new Date().toISOString().split('T')[0],
    //   ...groupData,
    // }));

    batch.set(groupRef, cleanObject({
      habits: listHabitRefs,
      createdAt: new Date().toISOString().split('T')[0],
      ...groupData,
    }));

    await batch.commit();  
    console.log("Group and habits created successfully");
    return { success: true, error: null, refs:{ groupRef, habitRefs: listHabitRefs } };
  } catch (error) {
    console.error("Error creating group with habits:", error);
    return { success: false, error, refs: null };
  }
};

// create Personnel group for the user
export const createNewUserAndGroup = async (name: string, email:string, avatar='') => {
  try {
    const batch = writeBatch(db);

    // 1. Create a new user document (Firestore will assign an ID)
    const newUserRef = doc(collection(db, "users")); // Get a ref with an auto-ID
    const newGroupRef = doc(collection(db, "singleGroups"));

    const newUserData = {
        id: newUserRef.id,
        name: name,
        email: email,
        avatar: avatar,
        singleGroup: newGroupRef.id,
        groups: [],
        createdAt: new Date(),
    }
    batch.set(newUserRef, newUserData);

    // 2. Create the new group document, referencing the new user
    const newGroupData = {
        createdAt: new Date(),
        ownerId: newUserRef.id,
        name: "My Single Group",
        description: 'No one can join.',
        habits:[],
        private: true,
    }
    batch.set(newGroupRef, newGroupData);

    // Commit the batch
    await batch.commit();
    console.log(`User ${name} and his "MySingleGroup" created successfully!`);

    return { success: true, error: null }
  } catch (error) {
    console.error("Error creating new user and group:", error)
  }
  return { success: true, error: null, userInfo:null }
}

// ----------------- UPDATE
//update Group
export const updateGroup = async (groupId: string, groupData: { name: string, description: string, private:boolean }) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    await setDoc(groupRef, groupData, { merge: true})
    console.log("Group updated successfully")
    const error = null
    return { success: true, error }
  } catch (error) {
    return { success: false, error }
  }
}
// ----------------- DELETE
//delete Group
export const deleteGroup = async (groupId: string, userId:string) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    const group = await getDoc(groupRef)
    if (!group.exists()){
      Alert.alert("Cannot delete", "Group not found. It might have been deleted already.")
      return { success: false, error: "Group not found. It might have been deleted already." }
    }
    if (group.data()?.ownerId !== userId){
      Alert.alert("Cannot delete", "You are not the owner of this group. You cannot delete it.")
      return { success: false, error: "You are not the owner of this group. You cannot delete it." }
    }
    await deleteDoc(groupRef)
    console.log("Group deleted successfully")
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

// Join a group which is not private
export const joinGroup = async (groupId: string, userId: string) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    const groupData = await getDoc(groupRef)
    if (groupData.data()?.private) {
      Alert.alert("Cannot join", "This group is private. You cannot join it.")
      return { success: false, error: "Group is private. You cannot join it." }
    }
    await updateDoc(groupRef, { members: arrayUnion(userId) })
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { groups: arrayUnion(groupId) })
    console.log("User joined group successfully")
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

// Leave a group
export const leaveGroup = async (groupId: string, userId: string) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    await updateDoc(groupRef, { members: arrayRemove(userId) })
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { groups: arrayRemove(groupId) })
    console.log("User left group successfully")
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}