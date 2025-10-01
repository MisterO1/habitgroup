import { Group, Rel_GroupMembers } from '@/types/interfaces';
import { supabase } from '@/utils/supabase';

// ----------------- READ
//get ALL Groups
export const getAllGroups = async () => {
    const { data, error } = await supabase.from('Groups').select('*');
    if (error) throw error;
    return data;
  };

// get all groups of a user
export const getGroupsByUserId = async (userId: string) => {
    const { data, error } = await supabase.from('Rel_GroupMembers').select('*').eq('user_id', userId)
    if (error) throw error;
    let listGroupId: (string | null)[] = []
    data.forEach((rel:Rel_GroupMembers) => {
        listGroupId.push(rel.group_id)
    })
    return listGroupId
}

//get Group by name
export const getGroupByName = async (name: string) => {
  const { data, error } = await supabase.from('Groups').select('*').contains('name', name);
  if (error) throw error;
  return data;
};

// ----------------- CREATE
//create Group
export const createGroup = async (Group: Group) => {
  const { data, error } = await supabase.from('Groups').insert(Group).select();
  if (error) throw error;
  return data;
};

// ----------------- UPDATE
//update Group
export const updateGroup = async (Group: Group) => {
  const { data, error } = await supabase.from('Groups').update(Group).eq('id', Group.id).select();
  if (error) throw error;
  return data;
};

// ----------------- DELETE
//delete Group
export const deleteGroup = async (Group: Group) => {
  const { data, error } = await supabase.from('Groups').delete().eq('id', Group.id).select();
  if (error) throw error;
  return data;
};
