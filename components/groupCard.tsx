import { useTheme } from '@/contexts/theme-context';
import { Group } from '@/types/interfaces';
import { router } from 'expo-router';
import { Calendar, Users } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GroupCard({ 
    userId,
    group,
} : {
    userId : string,
    group: Group,
 }) {

    const isOwner = group.ownerId === userId;
    const { colors } = useTheme();  
 
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
        </View>
  
        <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
          {group.description}
        </Text>
  
        <View style={styles.groupStats}>
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

      </TouchableOpacity>
    );
  }
  
const styles = StyleSheet.create({
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