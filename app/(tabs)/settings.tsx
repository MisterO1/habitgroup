import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { Stack, useRouter } from 'expo-router';
import { Bell, HelpCircle, LogOut, Moon, Shield, Sun, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuth } = useAuth();
  const { userInfo, clearUserInfo } = useUser()

  React.useEffect(() => {
    if (!isAuth) {
      router.push('/auth');
      return;
    }
  }, []);

  const { colors, toggleTheme, isDark } = useTheme();  
  const insets = useSafeAreaInsets();

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage your account',
      icon: User,
      onPress: () => {},
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Habit reminders and updates',
      icon: Bell,
      onPress: () => {},
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Data and privacy settings',
      icon: Shield,
      onPress: () => {},
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      icon: HelpCircle,
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {userInfo?.name.split('')[0]}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {userInfo?.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {userInfo?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Appearance
            </Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
            <View style={styles.settingLeft}>
              {isDark ? (
                <Moon size={20} color={colors.textSecondary} />
              ) : (
                <Sun size={20} color={colors.textSecondary} />
              )}
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? 'white' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Settings Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              General
            </Text>
          </View>
          
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingItem}
              onPress={item.onPress}
            >
              <View style={styles.settingLeft}>
                <item.icon size={20} color={colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={async () => {
              try {
                // Optionally show a loading indicator or confirmation dialog here
                const { signOutUser } = await import('@/controllers/auth-controllers');
                await signOutUser();
                await clearUserInfo()
                // Optionally, navigate to the auth screen after sign out
                // If using expo-router:
                const { router } = await import('expo-router');
                router.replace('/auth');
              } catch (err) {
                // Optionally handle error
                console.error('Sign out failed', err);
              }
            }}
          >
            <View style={styles.settingLeft}>
              <LogOut size={20} color={colors.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>
                  Sign Out
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            habitGroup v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 12,
  },
});