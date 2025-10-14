import { UserInfo } from '@/types/interfaces';
import { db } from '@/utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';

type UserContextValue = {
    userInfo: UserInfo | null;
    setUserInfo: Dispatch<SetStateAction<UserInfo | null>>;
    isLoading: boolean;
    loadUserInfo: (email: string) => Promise<void>
    clearUserInfo: () => Promise<void>
  };
const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children } : { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const data = await AsyncStorage.getItem('userInfo');
      if (data) setUserInfo(JSON.parse(data));
      setIsLoading(false);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (userInfo){
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
    }
  }, [userInfo]);

  const loadUserInfo = async (email: string | null) => {
    const info = await AsyncStorage.getItem('userInfo');
    if(info) {
      setUserInfo(JSON.parse(info) as UserInfo)
    } else {
      const q = query(collection(db, 'users'), where("email", "==", email))
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data()
        const info = { id: data.id, ...data } as UserInfo;
        setUserInfo(info);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        console.warn(`No user info found for ${email} in Firestore and AsyncStorage`);
      }
    }
    
    
  };
  const clearUserInfo = async () => {
    setUserInfo(null)
    await AsyncStorage.removeItem("userInfo")
  }

  const value = useMemo(() => ({ 
    userInfo, 
    setUserInfo, 
    isLoading, 
    loadUserInfo, 
    clearUserInfo,
  }), [userInfo, isLoading])
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within an UserProvider');
  return ctx;
}
