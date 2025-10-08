import { useTheme } from '@/contexts/theme-context';
import { observeAuthState, sendResetPassword, signInWithEmail, signUpWithEmail } from '@/controllers/auth-controllers';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = observeAuthState((user) => {
      if (user) {
        router.replace('/(tabs)/dashboard');
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          Alert.alert('Nom manquant', 'Veuillez renseigner votre nom.');
          return;
        }
        const { success, error } = await signUpWithEmail(name.trim(), email.trim(), password);
        if (!success) throw error as Error;
      } else {
        const { success, error } = await signInWithEmail(email.trim(), password);
        if (!success) throw error as Error;
      }
    } catch (err: any) {
      Alert.alert('Erreur', err?.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Saisissez votre email pour réinitialiser.');
      return;
    }
    const { success, error } = await sendResetPassword(email.trim());
    if (success) Alert.alert('Email envoyé', 'Vérifiez votre boîte mail.');
    else Alert.alert('Erreur', (error as any)?.message ?? 'Impossible denvoyer lem ail');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={[styles.title, { color: colors.text }]}>Bienvenue</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {mode === 'signin' ? 'Connectez-vous pour continuer' : 'Créez un compte pour commencer'}
        </Text>

        {mode === 'signup' && (
          <TextInput
            placeholder="Nom"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoCapitalize="words"
          />
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          secureTextEntry
          textContentType="password"
        />

        <TouchableOpacity disabled={loading} onPress={handleSubmit} style={[styles.button, { backgroundColor: colors.tabBarActive, opacity: loading ? 0.7 : 1 }]}> 
          <Text style={styles.buttonText}>{mode === 'signin' ? 'Se connecter' : "S'inscrire"}</Text>
        </TouchableOpacity>

        {mode === 'signin' && (
          <TouchableOpacity onPress={handleForgot}>
            <Text style={[styles.link, { color: colors.tabBarActive }]}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        <View style={styles.switchRow}>
          <Text style={{ color: colors.textSecondary }}>
            {mode === 'signin' ? "Nouveau ?" : 'Déjà un compte ?'}
          </Text>
          <TouchableOpacity onPress={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}>
            <Text style={[styles.link, { color: colors.tabBarActive, marginLeft: 8 }]}>
              {mode === 'signin' ? "Créer un compte" : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    fontWeight: '600',
    fontSize: 15,
    paddingVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});


