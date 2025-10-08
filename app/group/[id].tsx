import { db } from '@/utils/firebase';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("id",id)
  const [group, setGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchGroupById(groupId: string) {
      try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);
        if (!isMounted) return;
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = { id: docSnap.id, ...docSnap.data() } as any;
          setGroup(data);
        } else {
          setGroup(null);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load group');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (typeof id === 'string' && id) {
      fetchGroupById(id);
    } else {
      setLoading(false); 
      setGroup(null);
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <View><Text>Loading…</Text></View>;
  if (error) return <View><Text>{error}</Text></View>;
  if (!group) return <View><Text>Group not found! at id: {id}</Text></View>;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Group Doc id: {group.id}</Text>
      {group.name ? <Text>Name: {group.name}</Text> : null}
    </View>
  );
}
