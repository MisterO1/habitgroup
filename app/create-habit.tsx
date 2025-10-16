import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { addHabitToGroup, getUserGroups } from '@/controllers/group-controllers.tsx';
import { createHabit } from '@/controllers/habit-controllers';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateHabitScreen() {
  const { colors } = useTheme();
  const { userInfo } = useUser();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [groupId, setGroupId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // currently not using custom date inputs; keep startDate as ISO string for createdAt in controller
  const [startDate] = useState<string>(new Date().toISOString());
  const [endDate] = useState<string | null>(null);
  const [frequency, setFrequency] = useState('daily');
  const [category, setCategory] = useState('other');

  useEffect(() => {
    const load = async () => {
      if (!userInfo?.groups) return;
      const { data } = await getUserGroups(userInfo.groups);
      if (data) {
        setGroups(data);
        if (data.length > 0) setGroupId(data[0].id);
      }
    };
    load();
  }, [userInfo]);

  const handleSubmit = async () => {
    if (!groupId) return Alert.alert('Please select a group');
    if (!name.trim()) return Alert.alert('Please enter a habit name');

    setLoading(true);
    try {
      const habitData = {
        name: name.trim(),
        groupId: groupId,
        description: description.trim() || '',
        startDate: startDate,
        endDate: endDate ?? '',
        frequency,
        category: category,
        createdAt: new Date().toISOString().split('T')[0],
      } as any;

      // remove null values to avoid Firestore "undefined" problems
      const cleaned: any = {};
      Object.entries(habitData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) cleaned[k] = v;
      });

      const res = await createHabit(groupId, cleaned);
      if ( res.id ) {
        await addHabitToGroup( groupId, res.id );
        Alert.alert('Habit created');
      } else {
        Alert.alert('Error', 'Failed to create habit');
      }
      router.push('/(tabs)/dashboard');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Text style={[styles.title, { color: colors.text }]}>Create Habit</Text>

      <Text style={{ color: colors.text, marginBottom: 6 }}>Group</Text>
      {groups.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>No groups found</Text>
      ) : (
        <View style={{ marginBottom: 8 }}>
          {groups.map(g => (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGroupId(g.id)}
              style={[
                styles.groupOption,
                { backgroundColor: groupId === g.id ? colors.primary : colors.card }
              ]}
            >
              <Text style={{ color: groupId === g.id ? 'white' : colors.text }}>{g.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={{ color: colors.text, marginTop: 12 }}>Name</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={name} onChangeText={setName} placeholder="e.g. Morning run" placeholderTextColor={colors.textSecondary} />

      <Text style={{ color: colors.text, marginTop: 12 }}>Description</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text, height: 80 }]} value={description} onChangeText={setDescription} placeholder="Optional" placeholderTextColor={colors.textSecondary} multiline />

      <Text style={{ color: colors.text, marginTop: 12 }}>Frequency</Text>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {['daily', 'weekly', 'monthly'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFrequency(f)}
            style={[styles.smallOption, { backgroundColor: frequency === f ? colors.primary : colors.card }]}
          >
            <Text style={{ color: frequency === f ? 'white' : colors.text, textTransform: 'capitalize' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: colors.text, marginTop: 12 }}>Category</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {['fitness','reading','creativity','productivity','health','learning','social','other'].map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.smallOption, { backgroundColor: category === cat ? colors.primary : colors.card }]}
          >
            <Text style={{ color: category === cat ? 'white' : colors.text, textTransform: 'capitalize' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Create Habit</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderRadius: 8, padding: 12, marginTop: 6 },
  submitBtn: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  pickerWrapper: { borderRadius: 8, overflow: 'hidden', marginTop: 6 },
  groupOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  smallOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
});
