import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { createGroupWithHabits } from '@/controllers/group-controllers.tsx';
import { Habit } from '@/types/interfaces';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const { userInfo, loadUserInfo } = useUser();
  if (!userInfo) {
    throw new Error("User not logged in");
  }
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [habits, setHabits] = useState<Partial<Habit>[]>([
    { 
      name:'',
      description: '', 
      category: '', 
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      frequency: { type: 'WorkDays', days: [0,1,2,3,4,5] },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleHabitChange = (index: number, field: keyof Omit<Habit, 'frequency'>, value: string) => {
    const updated = [...habits];
    updated[index][field] = value;
    setHabits(updated);
  };

  const addHabit = () => {
    setHabits([...habits,
        { 
          name: '', 
          description: '',
          category: '', 
          startDate: new Date().toISOString().split('T')[0], 
          endDate: '', 
          frequency: { type: 'WorkDays', days: [0,1,2,3,4,5] } 
        }]);
  };

  const removeHabit = (index: number) => {
    if (habits.length === 1) return;
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    if (!groupName.trim()) {
      setError('Group name is required.');
      return;
    }
    if (!groupDescription.trim()) {
      setError('Group description is required.');
      return;
    }
    if (habits.some(h => !h.description?.trim())) {
      setError('All habits must have a description.');
      return;
    }
    if (habits.some(h => !h.name?.trim())) {
      setError('All habits must have a name.');
      return;
    }
    setLoading(true);
    try {
      const { refs } = await createGroupWithHabits(
        userInfo?.id || 'unknown',
      {
        name: groupName,    
        description: groupDescription,
        private: isPrivate,
        ownerId: userInfo?.id || 'unknown',
        members: userInfo?.id ? [userInfo.id] : [],
        createdAt: new Date().toISOString().split('T')[0],
      }, habits);
      if (!refs) throw new Error("Failed to get references after creating group");

      // Update userInfo's groups in firestore, context and asyncStorage
      loadUserInfo(userInfo.email);
      router.replace('/(tabs)/dashboard');
      
    } catch (e) {
      setError('Failed to create group.');
      console.error('Error creating group:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Text style={[styles.title, { color: colors.text }]}>Create New Group</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
        placeholder="Group Name"
        placeholderTextColor={colors.textSecondary}
        value={groupName}
        onChangeText={setGroupName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
        placeholder="Description"
        placeholderTextColor={colors.textSecondary}
        value={groupDescription}
        onChangeText={setGroupDescription}
      />
      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>Private Group</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>
      <Text style={[styles.subtitle, { color: colors.text, marginTop: 24 }]}>Habits</Text>
      {habits.map((habit, idx) => (
        <View key={idx} style={[styles.habitCard, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder={`Habit Name #${idx + 1}`}
            placeholderTextColor={colors.textSecondary}
            value={habit.name}
            onChangeText={val => handleHabitChange(idx, 'name', val)}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder={`Habit Description #${idx + 1}`}
            placeholderTextColor={colors.textSecondary}
            value={habit.description}
            onChangeText={val => handleHabitChange(idx, 'description', val)}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Category (e.g. fitness, reading)"
            placeholderTextColor={colors.textSecondary}
            value={habit.category}
            onChangeText={val => handleHabitChange(idx, 'category', val)}
          />
          <View style={styles.habitActions}>
            <TouchableOpacity onPress={() => removeHabit(idx)} disabled={habits.length === 1}>
              <Trash2 size={20} color={habits.length === 1 ? colors.border : colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={[styles.addHabitBtn, { backgroundColor: colors.primary }]} onPress={addHabit}>
        <Plus size={18} color="white" />
        <Text style={{ color: 'white', marginLeft: 8 }}>Add Habit</Text>
      </TouchableOpacity>
      {error ? <Text style={{ color: colors.error, marginTop: 12 }}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          {loading ? 'Creating...' : 'Create Group'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  habitCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  habitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  addHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  submitBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
