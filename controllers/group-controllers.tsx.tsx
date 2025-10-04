import { Group, listGroup, listmember } from '@/types/interfaces';
import { supabase } from '@/utils/supabase';

// ----------------- READ
//get ALL Groups
export const getAllGroups = async () => {
  console.log("fetch All groups")
  const { data, error } = await supabase
  .from('groups')
  .select('id,name,description,owner_id,created_at')
  return {data, error}
};

// get all groups of a user
export const getUserGroups = async (userId: string) => {
  console.log("fetch UserGroups")
  const { data, error } = await supabase
  .from('group_members')
  .select(`
    g:group_id(
      id,
      name,
      description,
      owner_id,
      created_at
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

// all groups that not include the user
export const getNotUserGroups = async (userId: string) => {
  console.log("fetch notUserGroups")
  const { data, error } = await supabase
  .from('group_members')
  .select(`
    g:group_id(
      id,
      name,
      description,
      owner_id,
      created_at
    )
  `)
  .neq('user_id', userId)
  if (data) {
    let listGroup: listGroup = []
    // @ts-ignore
    data.forEach((elt) => listGroup.push(elt.g))
    return { listGroup, error}
  }
  return {data, error}
}

// get all members of a group
export const getGroupMembers = async (groupId:string) => {
  console.log("fetch group members")
  const { data, error } = await supabase
  .from('group_members')
  .select(`
    profile:user_id(
      id,
      name,
      avatar
    )
  `)
  .eq('group_id',groupId)
  if (data) {
    let listMembers: listmember = []
    // @ts-ignore
    data.forEach((elt) => listMembers.push(elt.profile))
    return { listMembers, error}
  }
  return { data, error }
}

// get Group's habits
export const getGroupsHabits = async (groupId: string) => {
  console.log("fetch habits")
  const { data, error } = await supabase
  .from('habits')
  .select('id,name')
  .eq('group_id', groupId);
  // console.log("data",data)
  return { data, error }
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
