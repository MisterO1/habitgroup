// import { useHabits } from '@/contexts/habit-context';
import { useTheme } from '@/contexts/theme-context';
import { getUserGroups } from '@/controllers/group-controllers.tsx';
import { listGroup } from '@/types/interfaces';
import { Stack, router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const userId = 'eb1d083f-7f49-4cef-8ab0-7dae11982f30' // Alex
const userId1= '47ded865-98da-447b-b185-50a1bdcda570' // Nice
const userId2 = 'f6a3970d-d4b6-4663-a80b-98f45f644472' // kevin
const userId3 = 'fa4b5381-df05-465b-99c7-826431c045ea' // oli

export default function GroupsScreen() {
  const { colors } = useTheme();
  const [ isMounted, setIsMounted ] = useState(false)
  const [ err, setErr ] = useState('')
  const [selectedTab, setSelectedTab] = useState<'my-groups' | 'discover'>('my-groups');
  const insets = useSafeAreaInsets();

  // const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  // const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  // const [deleteData, setDeleteData] = useState<boolean>(false);
  // const [submitting, setSubmitting] = useState<boolean>(false);
  const [userGroups, setUserGroups] = useState<listGroup>(null)
  useEffect(() => {
    async function fetchUserGroups (){
      const {listGroup , error} = await getUserGroups(userId)
      console.log("listGroup",listGroup)
      if (error) {
        setErr(error.message)
        console.log("err",err)
        return
      }
      setUserGroups(listGroup as listGroup)
      console.log("userGroups",userGroups)
      console.log("error",error)
      setIsMounted(true)
    }
    fetchUserGroups()
  },[])
  


//   const onConfirmLeave = useCallback(() => {
//     try {
//       console.log('[GroupsScreen] Confirm leave', { deleteData, selectedGroupId });
//       if (!selectedGroupId) return;
//       setSubmitting(true);
//       const res = leaveGroup(selectedGroupId, { deleteData });
//       if ('error' in res) {
//         console.warn('[GroupsScreen] leave error', res.error);
//         setSubmitting(false);
//         return;
//       }
//       setSubmitting(false);
//       setShowLeaveModal(false);
//       setSelectedGroupId('');
//     } catch (e) {
//       console.error('[GroupsScreen] onConfirmLeave error', e);
//       setSubmitting(false);
//     }
//   }, [deleteData, selectedGroupId, leaveGroup]);

//   const openLeaveModal = (groupId: string) => {
//     setSelectedGroupId(groupId);
//     setDeleteData(false);
//     setShowLeaveModal(true);
//   };

  const renderGroupCard = (group: { id:string, name:string, description:string, owner_id:string}) => {
    console.log("group",group)
    const isOwner = group.owner_id === userId;
    
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
                  Admin
                </Text>
              </View>
            )}
          </View>
          {/* <TouchableOpacity 
            onPress={() => openLeaveModal(group.id)}
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

        {/* <View style={styles.groupStats}>
          <View style={styles.stat}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {group.members.length} members
            </Text>
          </View>
          <View style={styles.stat}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {group.habits.length} habits
            </Text>
          </View>
        </View>

        <View style={styles.membersRow}>
          {group.members.slice(0, 4).map((member: any, index: number) => (
            <Image
              key={member.id}
              source={{ uri: member.avatar }}
              style={[
                styles.memberAvatar,
                { borderColor: colors.surface },
                index > 0 && { marginLeft: -8 }
              ]}
            />
          ))}
          {group.members.length > 4 && (
            <View style={[styles.moreMembers, { backgroundColor: colors.border }]}>
              <Text style={[styles.moreMembersText, { color: colors.textSecondary }]}>
                +{group.members.length - 4}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.habitsPreview}>
          {group.habits.slice(0, 2).map((habit: any) => (
            <View key={habit.id} style={[styles.habitTag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.habitTagText, { color: colors.primary }]}>
                {habit.title}
              </Text>
            </View>
          ))}
          {group.habits.length > 2 && (
            <Text style={[styles.moreHabits, { color: colors.textSecondary }]}>
              +{group.habits.length - 2} more
            </Text>
          )}
        </View> */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Groups',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/create-group')} style={[styles.createButton, { backgroundColor: colors.primary }]}>
              <Plus size={20} color="white" />
            </TouchableOpacity>
          ),
        }} 
      />
      {/* tab to switch MyGroups-Discover */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'my-groups' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('my-groups')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'my-groups' ? 'white' : colors.textSecondary }
          ]}>
            My Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'discover' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('discover')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'discover' ? 'white' : colors.textSecondary }
          ]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {selectedTab === 'my-groups' ? (
          <>
            {(userGroups && userGroups.length > 0) ? (
              userGroups.map(renderGroupCard)
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Groups Yet
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Create or join a group to start building habits together
                </Text>
                <TouchableOpacity onPress={() => router.push('/create-group')} style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.emptyButtonText}>Create Group</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Discover Groups
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Find and join groups that match your interests
            </Text>
          </View>
        )}
      </ScrollView>

      {/* <Modal visible={showLeaveModal} transparent animationType="fade" onRequestClose={() => setShowLeaveModal(false)}>
        <View style={styles.modalBackdrop} testID="leaveModalBackdrop">
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]} testID="leaveModal">
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <LogOut size={24} color={colors.error} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Leave group</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Choose what to do with your activity data in this group.</Text>
            </View>

            <TouchableOpacity
              style={[styles.optionRow, { borderColor: colors.border }]}
              onPress={() => setDeleteData(false)}
              accessibilityState={{ selected: !deleteData }}
              testID="keepDataOption"
            >
              <View style={[styles.radio, { borderColor: colors.primary }, !deleteData ? { backgroundColor: colors.primary } : null ]} />
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Leave and keep my data</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Your past check-ins remain for the group stats.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, { borderColor: colors.border }]}
              onPress={() => setDeleteData(true)}
              accessibilityState={{ selected: deleteData }}
              testID="deleteDataOption"
            >
              <View style={[styles.radio, { borderColor: colors.error }, deleteData ? { backgroundColor: colors.error } : null ]} />
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Leave and delete my data</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>All your progress and comments in this group will be removed.</Text>
              </View>
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowLeaveModal(false)} style={[styles.actionBtn, { backgroundColor: colors.card }]} testID="cancelLeave">
                <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              { <TouchableOpacity onPress={onConfirmLeave} disabled={submitting} style={[styles.actionBtn, { backgroundColor: deleteData ? colors.error : colors.primary }]} testID="confirmLeave">
                <Text style={[styles.actionText, { color: '#fff' }]}>{submitting ? 'Leaving...' : 'Confirm'}</Text>
              </TouchableOpacity> }
            </View>
          </View>
        </View>
      </Modal> */}
    </View>
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