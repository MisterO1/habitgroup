import { Group, listGroup } from '@/types/interfaces';
import { supabase } from '@/utils/supabase';

// ----------------- READ
//get ALL Groups
export const getAllGroups = async () => {
    const { data, error } = await supabase.from('groups').select('*');
    if (error) throw error;
    return data;
  };

// get all groups of a user
export const getUserGroups = async (userId: string) => {
    const { data, error } = await supabase
    .from('group_members')
    .select(`
      g:group_id(
        id,
        name,
        description,
        owner_id
      )
    `)
    .eq('user_id', userId)
    if (data) {
      let listGroup: listGroup = []
      // @ts-ignore
      data.forEach((elt) => listGroup.push(elt.g))
      return { listGroup, error}
    }
    return {data, error}
}

//get Group by name
export const getGroupsBy = async (field: string, value: string) => {
  const { data, error } = await supabase.from('groups').select('*').contains(field, value);
  if (error) throw error;
  return data;
};

// ----------------- CREATE
//create Group
export const createGroup = async (Group: Group) => {
  const { data, error } = await supabase.from('groups').insert(Group).select();
  if (error) throw error;
  return data;
};

// ----------------- UPDATE
//update Group
export const updateGroup = async (Group: Group) => {
  const { data, error } = await supabase.from('groups').update(Group).eq('id', Group.id).select();
  if (error) throw error;
  return data;
};

// ----------------- DELETE
//delete Group
export const deleteGroup = async (Group: Group) => {
  const { data, error } = await supabase.from('groups').delete().eq('id', Group.id).select();
  if (error) throw error;
  return data;
};
