import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { sendResetPassword, signInWithEmail, signUpWithEmail } from '@/controllers/auth-controllers';
import { createNewUserAndGroup } from '@/controllers/group-controllers.tsx';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";


export default function AuthScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loadUserInfo } = useUser()


  const isValid = () => {
    const required = mode === 'signup'
      ? [
          { label: 'Nom', value: name },
          { label: 'Email', value: email },
          { label: 'Mot de passe', value: password },
        ]
      : [
          { label: 'Email', value: email },
          { label: 'Mot de passe', value: password },
        ];

    for (const { label, value } of required) {
      if (!value || !value.trim()) {
        setError(`${label} requis`);
        return false;
      }
    }
    setError('');
    return true;
  }


  const handleSubmit = async () => {
    
    if (!isValid() || loading) return;

    setLoading(true)
    
    try {
      if (mode === 'signup') {

        const { success, user, error } = await signUpWithEmail(name.trim(), email.trim(), password);
        if (!success || !user) throw error as Error;
        // add user in a collection
        const { error:errorInfo } = await createNewUserAndGroup(name.trim(), email.trim())
        if (errorInfo) throw errorInfo as Error

      } else {

        const { success, user, error } = await signInWithEmail(email.trim(), password);
        if (!success || !user) throw error as Error;

      }
      await loadUserInfo(email.trim())
      router.replace('/(tabs)/dashboard');

    } catch (err: any) {
      if (err?.message.includes("invalid-credential") || 
          err?.message.includes("invalid-email")){
        Alert.alert('Erreur', "email/password invalid")
        return
      }
      console.log(err.message)
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
            onChangeText={(text) => { setName(text); if (error) setError(''); }}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoCapitalize="words"
          />
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={(text) => { setEmail(text); if (error) setError(''); }}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={(text) => { setPassword(text); if (error) setError(''); }}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          secureTextEntry
          textContentType="password"
        />
        { error && (
          <View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
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
  errorText: {
    color: 'red',
    fontWeight:'500',
    fontSize: 13,
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


