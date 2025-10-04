import { useTheme } from '@/contexts/theme-context';
import { getGroupMembers, getGroupsHabits } from '@/controllers/group-controllers.tsx';
import { listmember } from '@/types/interfaces';
import { router } from 'expo-router';
import { Calendar, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GroupCard({ 
    profileId,
    group,
    joined = false,
} : {
    profileId : string,
    group: { id:string, name:string, description:string, owner_id:string, created_at:string},
    joined: boolean
 }) {

    const isOwner = group.owner_id === profileId;
    const { colors } = useTheme();
    const [ members, setMembers ] = useState<listmember>([])
    const [ habits, setHabits ] = useState<{id:string, name:string}[]>([])
    
    // let members: {id:string, name:string, avatar:string}[][] = []
    // let habits: {id:string, name:string}[] = []

    useEffect(()=>{
        async function fetchGroupMembers(groupId:string) {
          const { listMembers, error } = await getGroupMembers(groupId)
          if (error) {
              console.log("error",error)
              return
          } else if(listMembers){
            setMembers(listMembers)
          }
        }
        async function fetchGroupHabits(groupId:string) {
          const { data, error } = await getGroupsHabits(groupId)
          if (error) {
              console.log("error",error)
              return
          } else if(data){
            // data.map((elt) => habits.push(elt))
            setHabits(data)
          }
        }
        fetchGroupMembers(group.id)
        fetchGroupHabits(group.id)
    },[])
    
    return (
      <TouchableOpacity
        key={group.id}
        style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/group/${group.id}`)}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={[styles.groupName, { color: colors.text }]}>
              {group.name}
            </Text>
            {isOwner && (
              <View style={[styles.adminBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.adminText, { color: colors.primary }]}>
                  Owner
                </Text>
              </View>
            )}
          </View>
          {/* <TouchableOpacity 
            // onPress={() => openLeaveModal(group.id)}
            testID="openLeaveModalButton"
            style={styles.leaveButton}
            accessibilityLabel="Group settings"
          >
            <LogOut size={18} color={colors.textSecondary} />
            <Text style={[styles.leaveButtonText, { color: colors.textSecondary }]}>Leave</Text>
          </TouchableOpacity> */}
        </View>
  
        <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
          {group.description}
        </Text>
  
        <View style={styles.groupStats}>
          <View style={styles.stat}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {members?.length} members
            </Text>
          </View>
          <View style={styles.stat}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {habits.length} habits
            </Text>
          </View>
        </View>

        { joined == true ? (
          <>
          <View style={styles.membersRow}>
            {members ? (members?.slice(0, 2).map((member: any, index: number) => (
              <Image
                key={member.id+Date.now()}
                source={{ uri: member.avatar }}
                style={[
                  styles.memberAvatar,
                  { borderColor: colors.surface },
                  index > 0 && { marginLeft: -8 }
                ]}
              />
            ))) : (
              <Image
                source={{ uri: '' }}
                style={[
                  styles.memberAvatar,
                  { borderColor: colors.surface },
                ]}
              />
            )}
            {members && members.length > 4 && (
              <View style={[styles.moreMembers, { backgroundColor: colors.border }]}>
                <Text style={[styles.moreMembersText, { color: colors.textSecondary }]}>
                  +{members?.length - 2}
                </Text>
              </View>
            )}
        </View>        
  
        <View style={styles.habitsPreview}>
          {habits.map((habit: any) => (
            <View key={habit.id+Date.now()} style={[styles.habitTag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.habitTagText, { color: colors.primary }]}>
                {habit.name} 
              </Text>
            </View>
          ))}
        </View>
        </>
        ) : null}

      </TouchableOpacity>
    );
  }

  
const styles = StyleSheet.create({
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.05)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    leaveButtonText: {
      fontSize: 12,
      fontWeight: '500',
    },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalCard: { width: '100%', maxWidth: 420, borderRadius: 16, padding: 16 },
    modalHeader: { marginBottom: 8 },
    modalIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 83, 80, 0.15)', marginBottom: 8 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    modalSubtitle: { fontSize: 13 },
    optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, marginRight: 12 },
    optionTextWrap: { flex: 1 },
    optionTitle: { fontSize: 15, fontWeight: '600' },
    optionSubtitle: { fontSize: 12 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
    actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginLeft: 12 },
    actionText: { fontSize: 14, fontWeight: '600' },
    container: {
      flex: 1,
    },
    createButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      margin: 16,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 8,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },
    content: {
      flex: 1,
    },
    groupCard: {
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
    },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    groupInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    groupName: {
      fontSize: 18,
      fontWeight: '600',
    },
    adminBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    adminText: {
      fontSize: 10,
      fontWeight: '600',
    },
    groupStats: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 12,
    },
    membersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    memberAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
    },
    moreMembers: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: -8,
    },
    moreMembersText: {
      fontSize: 10,
      fontWeight: '600',
    },
    habitsPreview: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
    },
    habitTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    habitTagText: {
      fontSize: 12,
      fontWeight: '500',
    },
    moreHabits: {
      fontSize: 12,
    },
    emptyState: {
      margin: 16,
      padding: 32,
      borderRadius: 12,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    emptyButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    groupDescription: {
      fontSize: 14,
      marginBottom: 12,
      lineHeight: 20,
    },
  });