import { getGroupsByUserId } from '@/controllers/group-controllers.tsx';
import { Habit } from '@/types/interfaces';
import { supabase } from '@/utils/supabase';

// -GET -
//get ALL Habits
export const getAllHabits = async () => {
    const { data: Habits, error } = await supabase.from('Habits').select('*');
    if (error) throw error;
    return Habits;
  };

// get all habits of a user
export const getHabitsByUserId = async (userId: string) => {
    try {
        const listGroupId = await getGroupsByUserId(userId)
        const data = await supabase.from('Habits').select('*').in('group_id',listGroupId)
        return data
    } catch(error){
        throw error
    }
}

//get habit by name
export const getHabitByName = async (name: string) => {
  const { data, error } = await supabase.from('Habits').select('*').contains('name', name);
  if (error) throw error;
  return data;
};

// -POST -
//create habit
export const createHabit = async (habit: Habit) => {
  const { data, error } = await supabase.from('Habits').insert(habit).select();
  if (error) throw error;
  return data;
};

// -PUT -
//update habit
export const updateHabit = async (habit: Habit) => {
  const { data, error } = await supabase.from('Habits').update(habit).eq('id', habit.id).select();
  if (error) throw error;
  return data;
};

// -DELETE -
//delete habit
export const deleteHabit = async (habit: Habit) => {
  const { data, error } = await supabase.from('Habits').delete().eq('id', habit.id).select();
  if (error) throw error;
  return data;
};
