import { db } from '@/utils/firebase';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";



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

// get all groups of a user
export const getUserGroups = async (userId: string) => {
  try {
    const q = query(collection(db, "groups"), where("members","array-contains",userId))
    const querySnapshot = await getDocs(q);
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
export const getGroupMembers = async (groupId:string) => {
  try {
    const q = query(collection(db, "groups"))
    const querySnapshot = await getDocs(q);
    const groupData = querySnapshot.docs[0].data()
    console.log("groupData", groupData)
    // @ts-ignore
    const listMembersIds: string[] = groupData.members
    let listMembersData: any[] = []

    const q_ = query(collection(db, "users"), where('id', "in", listMembersIds))
    const querySnapshot_ = await getDocs(q_);
    querySnapshot_.docs.forEach((doc)=> listMembersData.push(doc.data()))

    const data = listMembersData
    const error = null
    return { data, error }
  } catch (error) {
    const data = null
    return { data, error }
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

// ----------------- CREATE
//create Group
export const createGroup = async (
    groupData: { name: string, description: string },
    userId: string
) => {
  try {
    const userRef = doc(db,"users", userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
        console.error(`User with Id : ${userId} does not exist. Cannot create group.`)
        return
    }
    const newGroupData = {
        createdAt: new Date(),
        ownerId: userRef,
        name: groupData.name,
        description: groupData.description,
        members: [userRef], // the owner is also a user
        private: true,
    }
    const docRef = await addDoc(collection(db, "groups"), newGroupData)
    console.log("New group created with ID:", docRef.id, "and Owner:", userSnap.data()?.name);
    return { docRef, error:null }
  } catch (error) {
    return { docRef: null, error }
  }
};

// create Personnel group for the user
export const createNewUserAndGroup = async (name: string, email:string, avatar='') => {
  try {
    const batch = writeBatch(db);

    // 1. Create a new user document (Firestore will assign an ID)
    const newUserRef = doc(collection(db, "users")); // Get a ref with an auto-ID
    const newGroupRef = doc(collection(db, "groups"));

    const newUserData = {
        name: name,
        email: email,
        avatar: avatar,
        groups: [newGroupRef],
        createdAt: new Date(),
    }
    batch.set(newUserRef, newUserData);

    // 2. Create the new group document, referencing the new user
    const newGroupData = {
        createdAt: new Date(),
        ownerId: newUserRef,
        name: "MySingleGroup",
        description: 'Only me can see manage this group. No one can join.',
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
export const updateGroup = async (groupId: string, groupData: { name: string, description: string }) => {
  try {
    const groupRef = doc(db, "groups", groupId)
    await setDoc(groupRef, groupData)
    console.log("Group updated successfully")
    const error = null
    return { success: true, error }
  } catch (error) {
    return { success: false, error }
  }
}
// ----------------- DELETE
//delete Group
export const deleteGroup = async (groupId: string) => {
  try {
    const groupRef = doc(db, "groups", groupId)
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
      return { success: false, error: "Group is private. You cannot join private groups." }
    }
    await updateDoc(groupRef, { members: arrayUnion(userId) })
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
    console.log("User left group successfully")
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}