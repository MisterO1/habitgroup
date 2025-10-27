import { Status } from "@/types/interfaces";
import { db } from '@/utils/firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Alert } from 'react-native';

// GET all statuses for user's groups
export const getUserStatuses = async (groupIds: string[]) => {
  try {
    if (!groupIds || groupIds.length === 0) {
      return { data: [], error: null };
    }

    const statusesRef = collection(db, "statuses");
    let allStatuses: Status[] = [];

    // Firebase has a limit of 10 items in "in" queries
    // So we need to split into chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < groupIds.length; i += chunkSize) {
      const chunk = groupIds.slice(i, i + chunkSize);
      const q = query(
        statusesRef,
        where("groupId", "in", chunk),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const chunkStatuses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Status[];

      allStatuses = [...allStatuses, ...chunkStatuses];
    }

    // Sort by createdAt desc
    allStatuses.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { data: allStatuses, error: null };
  } catch (error) {
    console.error("Error fetching user statuses:", error);
    return { data: null, error: error };
  }
};

// GET statuses for a specific group
export const getGroupStatuses = async (groupId: string) => {
  try {
    const statusesRef = collection(db, "statuses");
    const q = query(
      statusesRef,
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Status[];

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching group statuses:", error);
    return { data: null, error: error };
  }
};

// CREATE a new status
export const createStatus = async (statusData: Omit<Status, 'id'>) => {
  try {
    const statusesRef = collection(db, "statuses");
    const docRef = await addDoc(statusesRef, {
      ...statusData,
      createdAt: statusData.createdAt || new Date().toISOString(),
      expiresAt: statusData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      views: statusData.views || [],
    });

    return { success: true, id: docRef.id, error: null };
  } catch (error) {
    console.error("Error creating status:", error);
    return { success: false, id: null, error };
  }
};

// UPDATE status (add view)
export const updateStatusViews = async (statusId: string, userId: string) => {
  try {
    const statusRef = doc(db, "statuses", statusId);
    const statusDoc = await getDoc(statusRef);
    
    if (!statusDoc.exists()) {
      return { success: false, error: "Status not found" };
    }

    const statusData = statusDoc.data();
    const views = statusData.views || [];
    
    if (!views.includes(userId)) {
      await updateDoc(statusRef, {
        views: [...views, userId],
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating status views:", error);
    return { success: false, error };
  }
};

// UPDATE status content
export const updateStatus = async (statusId: string, updates: Partial<Status>) => {
  try {
    const statusRef = doc(db, "statuses", statusId);
    await updateDoc(statusRef, updates);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error };
  }
};

// DELETE status
export const deleteStatus = async (statusId: string, userId: string) => {
  try {
    const statusRef = doc(db, "statuses", statusId);
    const statusDoc = await getDoc(statusRef);
    
    if (!statusDoc.exists()) {
      Alert.alert("Error", "Status not found");
      return { success: false, error: "Status not found" };
    }

    const statusData = statusDoc.data();
    if (statusData.userId !== userId) {
      Alert.alert("Error", "You can only delete your own statuses");
      return { success: false, error: "Unauthorized" };
    }

    await deleteDoc(statusRef);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting status:", error);
    return { success: false, error };
  }
};

// Get a single status by ID
export const getStatusById = async (statusId: string) => {
  try {
    const statusRef = doc(db, "statuses", statusId);
    const statusDoc = await getDoc(statusRef);
    
    if (!statusDoc.exists()) {
      return { success: false, data: null, error: "Status not found" };
    }

    const data = {
      id: statusDoc.id,
      ...statusDoc.data(),
    } as Status;

    return { success: true, data, error: null };
  } catch (error) {
    console.error("Error getting status by ID:", error);
    return { success: false, data: null, error };
  }
};

