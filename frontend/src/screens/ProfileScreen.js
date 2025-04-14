import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Mock user data
const initialUserData = {
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  joined: 'June 2023',
  profilePhoto: null, // In a real app, this would be a uri to an image
  stats: {
    totalSaved: 1245.50,
    expenseCount: 145,
    streakDays: 28
  }
};

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(initialUserData);
  
  // Profile editing states
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [email, setEmail] = useState(userData.email);
  
  // Profile picture states
  const [profilePictureOptionsVisible, setProfilePictureOptionsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Categories state for stats
  const [categories, setCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  
  // Load categories from AsyncStorage on mount for stats
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedExpenseCategories = await AsyncStorage.getItem('expenseCategories');
        const storedIncomeCategories = await AsyncStorage.getItem('incomeCategories');
        
        if (storedExpenseCategories) {
          setCategories(JSON.parse(storedExpenseCategories));
        }
        
        if (storedIncomeCategories) {
          setIncomeCategories(JSON.parse(storedIncomeCategories));
        }
      } catch (error) {
        console.log('Error loading categories from storage:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  // Request camera/gallery permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        try {
          const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
          const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          
          if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
            Alert.alert(
              'Permissions Required',
              'Please grant camera and media library permissions to update your profile picture. Go to your device settings to enable these permissions.',
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('Error requesting permissions:', error);
        }
      }
    })();
  }, []);
  
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleSaveProfile = () => {
    const updatedUserData = {
      ...userData,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email
    };
    
    setUserData(updatedUserData);
    setEditProfileVisible(false);
    
    // In a real app, you would make an API call here to update the user's profile
    Alert.alert('Success', 'Profile updated successfully');
  };
  
  const takePhotoFromCamera = async () => {
    try {
      setLoading(true);
      setProfilePictureOptionsVisible(false);
      
      // Check camera permission before proceeding
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Denied',
          'To take a photo, you need to allow the app to access your camera. Please go to your device settings to enable camera access.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateProfilePicture(result.assets[0].uri);
      } else {
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
      setLoading(false);
    }
  };
  
  const selectPhotoFromGallery = async () => {
    try {
      setLoading(true);
      setProfilePictureOptionsVisible(false);
      
      // Check media library permission before proceeding
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Denied',
          'To select a photo, you need to allow the app to access your photo library. Please go to your device settings to enable photo library access.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateProfilePicture(result.assets[0].uri);
      } else {
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
      console.error('Gallery error:', error);
      setLoading(false);
    }
  };
  
  const updateProfilePicture = async (uri) => {
    try {
      // In a real app, you would upload the image to a server here
      
      // For now, we'll just update the local state
      setUserData({
        ...userData,
        profilePhoto: uri
      });
      
      Alert.alert('Success', 'Profile picture updated successfully');
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      console.error('Upload error:', error);
      setLoading(false);
    }
  };
  
  const removeProfilePicture = () => {
    setProfilePictureOptionsVisible(false);
    
    if (userData.profilePhoto) {
      setUserData({
        ...userData,
        profilePhoto: null
      });
      
      Alert.alert('Success', 'Profile picture removed');
    }
  };

  const handleSelectProfilePicture = (source) => {
    if (source === 'camera') {
      takePhotoFromCamera();
    } else if (source === 'gallery') {
      selectPhotoFromGallery();
    } else if (source === 'remove') {
      removeProfilePicture();
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const renderMenuItem = (icon, title, subtitle, onPress, rightElement) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      {rightElement && <View style={styles.menuRight}>{rightElement}</View>}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screenPadding}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileMain}>
                <TouchableOpacity 
                  style={styles.profileImageContainer}
                  onPress={() => setProfilePictureOptionsVisible(true)}
                >
                  {loading ? (
                    <View style={styles.profilePhotoPlaceholder}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    </View>
                  ) : userData.profilePhoto ? (
                    <Image source={{ uri: userData.profilePhoto }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profilePhotoPlaceholder}>
                      <Text style={styles.profileInitials}>
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userData.name}</Text>
                  <Text style={styles.profileEmail}>{userData.email}</Text>
                  <Text style={styles.profileJoined}>Member since {userData.joined}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={navigateToSettings}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${userData.stats.totalSaved}</Text>
                <Text style={styles.statLabel}>Total Saved</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData.stats.expenseCount}</Text>
                <Text style={styles.statLabel}>Expenses</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData.stats.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
          
          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {renderMenuItem('person-outline', 'Personal Information', 'Update your profile details', () => setEditProfileVisible(true))}
            {renderMenuItem('lock-closed-outline', 'Security', 'Manage your security settings', () => {})}
            {renderMenuItem('notifications-outline', 'Notifications', 'Configure your notification preferences', () => {})}
            {renderMenuItem('language-outline', 'Language', 'Change app language', () => {})}
            {renderMenuItem('moon-outline', 'Theme', 'Change app theme', () => {})}
          </View>

          {/* Data & Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            {renderMenuItem('cloud-download-outline', 'Export Data', 'Download your account data', () => {})}
            {renderMenuItem('shield-checkmark-outline', 'Privacy Settings', 'Manage your privacy preferences', () => {})}
            {renderMenuItem('trash-outline', 'Delete Account', 'Permanently delete your account', () => {}, <Ionicons name="warning" size={20} color="#FF3B30" />)}
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            {renderMenuItem('help-circle-outline', 'Help Center', 'Get help with the app', () => {})}
            {renderMenuItem('mail-outline', 'Contact Us', 'Send us a message', () => {})}
            {renderMenuItem('information-circle-outline', 'About', 'Learn more about the app', () => {})}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileVisible}
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Profile Picture Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profilePictureOptionsVisible}
        onRequestClose={() => setProfilePictureOptionsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Picture</Text>
              <TouchableOpacity onPress={() => setProfilePictureOptionsVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.pictureOption}
              onPress={() => handleSelectProfilePicture('camera')}
            >
              <Ionicons name="camera" size={22} color="#FFFFFF" style={styles.pictureOptionIcon} />
              <Text style={styles.pictureOptionText}>Take a Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.pictureOption}
              onPress={() => handleSelectProfilePicture('gallery')}
            >
              <Ionicons name="images" size={22} color="#FFFFFF" style={styles.pictureOptionIcon} />
              <Text style={styles.pictureOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            {userData.profilePhoto && (
              <TouchableOpacity 
                style={[styles.pictureOption, styles.removePictureOption]}
                onPress={() => handleSelectProfilePicture('remove')}
              >
                <Ionicons name="trash" size={22} color="#FF3B30" style={styles.pictureOptionIcon} />
                <Text style={[styles.pictureOptionText, styles.removePictureText]}>Remove Profile Picture</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  screenPadding: {
    padding: 15,
  },
  profileCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileMain: {
    flexDirection: 'row',
    flex: 1,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  profileJoined: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginLeft: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333333',
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  menuRight: {
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#276EF1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pictureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  pictureOptionIcon: {
    marginRight: 15,
  },
  pictureOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  removePictureOption: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  removePictureText: {
    color: '#FF3B30',
  },
  profilePhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#276EF1',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ProfileScreen; 