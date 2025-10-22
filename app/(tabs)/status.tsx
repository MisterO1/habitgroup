import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import { useAppStore } from '@/contexts/zustand';
import { mockStatuses } from '@/mocks/status-data';
import { Status as StatusType } from '@/types/interfaces';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { Camera, Clock, Eye, ImageIcon, Plus, Trash2, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StatusScreen() {
  const { colors } = useTheme();
  const { userInfo } = useUser()
  if (!userInfo?.id) return (<Text> userInfo Id missed</Text>)
  
  const insets = useSafeAreaInsets();

  // read status state
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [statuses, setStatuses] = useState<StatusType[]>(mockStatuses);

  // create status state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newStatusContent, setNewStatusContent] = useState('');
  const [selectedHabitTag, setSelectedHabitTag] = useState('general');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const userGroupIds = userInfo?.groups
  const { userHabitsZus } = useAppStore()

  const relevantStatuses = statuses.filter(status => 
    userGroupIds?.includes(status.groupId)
    //&& new Date(status.expiresAt) > new Date()
  );

  const groupedStatuses = relevantStatuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, StatusType[]>);

  const users = Object.keys(groupedStatuses).map(userId => {
    const userStatuses = groupedStatuses[userId];
    const hasUnviewed = userStatuses.some(s => !s.views.includes(userInfo?.id));
    return {
      userId,
      statuses: userStatuses,
      hasUnviewed,
      userName: userStatuses[0].userName || "",
      userAvatar: userStatuses[0].userAvatar || "",
      latestStatus: userStatuses[0],
    };
  }).sort((a, b) => {
    if (a.hasUnviewed !== b.hasUnviewed) {
      return a.hasUnviewed ? -1 : 1;
    }
    return new Date(b.latestStatus.createdAt).getTime() - new Date(a.latestStatus.createdAt).getTime();
  });

  const handleStatusView = useCallback((status: StatusType) => {
    setSelectedStatus(status);
    if (!status.views.includes(userInfo?.id)) {
      setStatuses(prev => prev.map(s => 
        s.id === status.id 
          ? { ...s, views: [...s.views, userInfo?.id] }
          : s
      ));
    }
  }, [userInfo?.id]);

  const handleCloseStatus = useCallback(() => {
    setSelectedStatus(null);
  }, []);

  const handlePickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleCreateStatus = useCallback(() => {
    if (!newStatusContent.trim()) return;

    const newStatus: StatusType = {
      id: Date.now().toString(),
      userId: userInfo?.id,
      userName: userInfo?.name,
      userAvatar: userInfo.avatar,
      content: newStatusContent,
      imageUrl: selectedImage || undefined,
      habitTag: selectedHabitTag,
      groupId: userGroupIds[0] || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      views: [],
    };

    setStatuses(prev => [newStatus, ...prev]);
    setNewStatusContent('');
    setSelectedHabitTag('general');
    setSelectedImage(null)
    setIsCreateModalVisible(false);
  }, [newStatusContent, selectedHabitTag, userInfo, userGroupIds, selectedImage]);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const statusDate = new Date(date);
    const diffMs = now.getTime() - statusDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  };

  const renderStatusRing = (userItem: typeof users[0]) => {
    const hasUnviewed = userItem.hasUnviewed;
    
    return (
      <TouchableOpacity
        key={userItem.userId}
        style={styles.statusRingContainer}
        onPress={() => handleStatusView(userItem.statuses[0])}
      >
        <View style={[
          styles.statusRing,
          hasUnviewed && { borderColor: colors.primary },
          !hasUnviewed && { borderColor: colors.border },
        ]}>
          <Image
            source={{ uri: userItem.userAvatar }}
            style={styles.statusAvatar}
          />
        </View>
        <Text 
          style={[styles.statusUserName, { color: colors.text }]}
          numberOfLines={1}
        >
          {userItem.userName.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Status',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {users.length > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusRingsContainer}
            >
              {users.map(renderStatusRing)}
            </ScrollView>

            <View style={styles.statusListContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Updates
              </Text>
              {relevantStatuses.slice(0, 10).map(status => {
                const isViewed = status.views.includes(userInfo?.id);
                return (
                  <TouchableOpacity
                    key={status.id}
                    style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleStatusView(status)}
                  >
                    <View style={styles.statusCardHeader}>
                      <Image
                        source={{ uri: status.userAvatar }}
                        style={styles.statusCardAvatar}
                      />
                      <View style={styles.statusCardInfo}>
                        <Text style={[styles.statusCardName, { color: colors.text }]}>
                          {status.userName}
                        </Text>
                        <View style={styles.statusCardMeta}>
                          <Clock size={12} color={colors.textSecondary} />
                          <Text style={[styles.statusCardTime, { color: colors.textSecondary }]}>
                            {getTimeAgo(status.createdAt)}
                          </Text>
                        </View>
                      </View>
                      {!isViewed && (
                        <View style={[styles.unviewedDot, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <View style={styles.statusCardContentContainer}>
                      <View style={[styles.habitTag, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                        <Text style={[styles.habitTagText, { color: colors.primary }]}>#{status.habitTag}</Text>
                      </View>
                      <Text 
                        style={[styles.statusCardContent, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {status.content}
                      </Text>
                    </View>
                    {status.imageUrl && (
                      <Image
                        source={{ uri: status.imageUrl }}
                        style={[styles.statusCardImage, { backgroundColor: colors.border }]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Status Updates
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              When members of your groups share updates, they&apos;ll appear here
            </Text>
          </View>
        )}
      </ScrollView>

      {/* { Watch status modal } */}
      <Modal
        visible={!!selectedStatus}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStatus}
      >
        {selectedStatus && (
          <View style={[styles.statusModal, { backgroundColor: colors.background }]}>
            <View style={[styles.statusModalHeader, { paddingTop: insets.top + 16 }]}>
              <View style={styles.statusModalHeaderLeft}>
                <Image
                  source={{ uri: selectedStatus.userAvatar }}
                  style={styles.statusModalAvatar}
                />
                <View>
                  <Text style={[styles.statusModalName, { color: colors.text }]}>
                    {selectedStatus.userName}
                  </Text>
                  <Text style={[styles.statusModalTime, { color: colors.textSecondary }]}>
                    {getTimeAgo(selectedStatus.createdAt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCloseStatus}
                style={styles.statusModalClose}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.statusModalContent}>
              {selectedStatus.imageUrl && (
                <Image
                  source={{ uri: selectedStatus.imageUrl }}
                  style={styles.statusModalImage}
                  resizeMode="contain"
                />
              )}
              <View style={[styles.statusModalTextContainer, { backgroundColor: colors.card }]}>
                <View style={[styles.habitTag, { backgroundColor: colors.primary + '20', borderColor: colors.primary, marginBottom: 12 }]}>
                  <Text style={[styles.habitTagText, { color: colors.primary }]}>#{selectedStatus.habitTag}</Text>
                </View>
                <Text style={[styles.statusModalText, { color: colors.text }]}>
                  {selectedStatus.content}
                </Text>
              </View>
            </View>

            <View style={[styles.statusModalFooter, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.statusModalStats}>
                <Eye size={16} color={colors.textSecondary} />
                <Text style={[styles.statusModalStatsText, { color: colors.textSecondary }]}>
                  {selectedStatus.views.length} {selectedStatus.views.length === 1 ? 'view' : 'views'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* { Post status modal } */}
      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.createModalContainer}
        >
          <TouchableOpacity
            style={styles.createModalBackdrop}
            activeOpacity={1}
            onPress={() => setIsCreateModalVisible(false)}
          />
          <View style={[styles.createModalContent, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.createModalHeader}>
              <Text style={[styles.createModalTitle, { color: colors.text }]}>Create Status</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.createModalBody}>
              <Text style={[styles.createModalLabel, { color: colors.textSecondary }]}>Habit Tag</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.habitTagsScrollView}
              >
                <TouchableOpacity
                  style={[
                    styles.habitTagButton,
                    { 
                      backgroundColor: selectedHabitTag === 'general' ? colors.primary : colors.card,
                      borderColor: selectedHabitTag === 'general' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedHabitTag('general')}
                >
                  <Text style={[
                    styles.habitTagButtonText,
                    { color: selectedHabitTag === 'general' ? '#fff' : colors.text }
                  ]}>general</Text>
                </TouchableOpacity>
                {userHabitsZus.map(habit => (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habitTagButton,
                      { 
                        backgroundColor: selectedHabitTag === habit.name ? colors.primary : colors.card,
                        borderColor: selectedHabitTag === habit.name ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setSelectedHabitTag(habit.name)}
                  >
                    <Text style={[
                      styles.habitTagButtonText,
                      { color: selectedHabitTag === habit.name ? '#fff' : colors.text }
                    ]}>{habit.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.createModalLabel, { color: colors.textSecondary, marginTop: 16 }]}>Image (Optional)</Text>
              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={[styles.imagePreview, { backgroundColor: colors.border }]}
                  />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: colors.surface }]}
                    onPress={handleRemoveImage}
                  >
                    <Trash2 size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageOptionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.imageOptionButton,
                      { backgroundColor: colors.card, borderColor: colors.border }
                    ]}
                    onPress={handleTakePhoto}
                  >
                    <Camera size={24} color={colors.primary} />
                    <Text style={[styles.imageOptionText, { color: colors.text }]}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.imageOptionButton,
                      { backgroundColor: colors.card, borderColor: colors.border }
                    ]}
                    onPress={handlePickImage}
                  >
                    <ImageIcon size={24} color={colors.primary} />
                    <Text style={[styles.imageOptionText, { color: colors.text }]}>Choose Photo</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.createModalLabel, { color: colors.textSecondary, marginTop: 16 }]}>Content</Text>
              <TextInput
                style={[
                  styles.createModalInput,
                  { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Share your progress..."
                placeholderTextColor={colors.textSecondary}
                value={newStatusContent}
                onChangeText={setNewStatusContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.createModalButton,
                  { backgroundColor: colors.primary },
                  (!newStatusContent.trim() && !selectedImage) && { opacity: 0.5 }
                ]}
                onPress={handleCreateStatus}
                disabled={!newStatusContent.trim() && !selectedImage}
              >
                <Text style={styles.createModalButtonText}>Post Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + 20 }
        ]}
        onPress={() => setIsCreateModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  statusRingsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  statusRingContainer: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  statusRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusUserName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  statusCardInfo: {
    flex: 1,
  },
  statusCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusCardTime: {
    fontSize: 12,
  },
  unviewedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCardContentContainer: {
    gap: 8,
  },
  statusCardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  habitTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  habitTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusCardImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
    lineHeight: 20,
  },
  statusModal: {
    flex: 1,
  },
  statusModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusModalName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusModalTime: {
    fontSize: 12,
  },
  statusModalClose: {
    padding: 8,
  },
  statusModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statusModalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    marginBottom: 24,
  },
  statusModalTextContainer: {
    padding: 16,
    borderRadius: 12,
    maxWidth: '90%',
  },
  statusModalText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  statusModalFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusModalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusModalStatsText: {
    fontSize: 14,
  },

  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  createModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  createModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  createModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  createModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  createModalBody: {
    paddingHorizontal: 20,
  },
  createModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  habitTagsScrollView: {
    marginBottom: 8,
  },
  habitTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  habitTagButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createModalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  createModalButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  imageOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  imageOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
