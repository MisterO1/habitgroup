import { Group, Habit, SingleGroup } from "@/types/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  userSingleGroupZus: SingleGroup | null;
  userGroupsZus: Group[];
  userHabitsZus: Habit[];
  setUserSingleGroupZus: (SingleGroup: SingleGroup | null) => void;
  setUserGroupsZus: (groups: Group[]) => void;
  setUserHabitsZus: (habits: Habit[]) => void;
  reset: () => void;
}

export const useAppStore = create(
  persist<AppState>(
    (set) => ({
      userSingleGroupZus: null,
      userGroupsZus: [],
      userHabitsZus: [],
      setUserSingleGroupZus: (SingleGroup) => set({ userSingleGroupZus: SingleGroup }),
      setUserGroupsZus: (groups) => set({ userGroupsZus: groups }),
      setUserHabitsZus: (habits) => set({ userHabitsZus: habits }),
      reset: () =>
        set({
          userSingleGroupZus: null,
          userGroupsZus: [],
          userHabitsZus: [],
        }),
    }),
    {
      name: "ghabit-storage",// key for the storage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
