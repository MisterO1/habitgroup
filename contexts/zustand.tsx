import { completion, Group, Habit } from "@/types/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  userGroupsZus: Group[];
  userHabitsZus: Habit[];
  completionsZus: Record<string, completion[]>;
  setUserGroupsZus: (groups: Group[]) => void;
  setUserHabitsZus: (habits: Habit[]) => void;
  setCompletionZus: (completionsZus: Record<string, completion[]>) => void;
  updateHabitCompletion: (habitId: string, groupId: string, completions: completion[]) => void;
  reset: () => void;
}

export const useAppStore = create(
  persist<AppState>(
    (set) => ({
      userGroupsZus: [],
      userHabitsZus: [],
      completionsZus: {},
      setUserGroupsZus: (groups) => set( () => ({ userGroupsZus: [...groups] })),
      setUserHabitsZus: (habits) => set({ userHabitsZus: habits }),
      setCompletionZus: (completions) => set({ completionsZus: completions }),
      updateHabitCompletion: (habitId, groupId, completions) =>
        set((state) => ({
          completionsZus: {
            ...state.completionsZus,
            [`${habitId}-${groupId}`]: completions,
          },
        })),
      reset: () =>
        set({
          userGroupsZus: [],
          userHabitsZus: [],
          completionsZus: {},
        }),
    }),
    {
      name: "ghabit-storage",// key for the storage
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          console.log("⚠️ Ancien cache détecté, reset du store...");
          const emptyState: AppState = {
            userGroupsZus: [],
            userHabitsZus: [],
            completionsZus: {},
            setUserGroupsZus: () => {},
            setUserHabitsZus: () => {},
            setCompletionZus: () => {},
            updateHabitCompletion: () => {},
            reset: () => {},
          };
          return emptyState;
        }

        // Sinon, on garde les données existantes
        return persistedState as AppState;
      }
    }
  )
);

// --- 🧹 Fonction utilitaire : reset complet du cache ---
export const clearAppStore = async () => {
  try {
    await AsyncStorage.removeItem("ghabit-storage");
    console.log("🧼 Cache Zustand supprimé avec succès !");
  } catch (e) {
    console.error("❌ Erreur lors de la suppression du cache :", e);
  }
};
