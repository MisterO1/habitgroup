import { observeAuthState } from '@/controllers/auth-controllers';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const [isAuthed, setIsAuthed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const unsub = observeAuthState((user) => setIsAuthed(!!user));
    return () => unsub();
  }, []);

  if (isAuthed === null) return null;

  return (
    <Redirect
      href={{
        pathname: isAuthed ? '/(tabs)/dashboard' : '/auth',
      }}
    />
  );
}