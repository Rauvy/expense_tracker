import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, getUserBalance, updateUserProfile } from '../services/userService';
import { useNavigation } from '@react-navigation/native';
import { TextInput as PaperTextInput } from 'react-native-paper';

// Initial user data structure
const initialUserData = {
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  joined: '',
  profilePhoto: null,
  stats: {
    totalSaved: 0,
    expenseCount: 0,
    streakDays: 0
  }
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(initialUserData);

  // Profile editing states
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Profile picture states
  const [profilePictureOptionsVisible, setProfilePictureOptionsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preferences states
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [budgetPeriodModalVisible, setBudgetPeriodModalVisible] = useState(false);
  const [budgetPeriod, setBudgetPeriod] = useState('month');

  // Category Management States
  const [activeTab, setActiveTab] = useState('expense');
  const [categories, setCategories] = useState([
    { name: 'Food', icon: 'fast-food', color: '#FF9500' },
    { name: 'Shopping', icon: 'cart', color: '#5856D6' },
    { name: 'Transport', icon: 'car', color: '#FF2D55' },
    { name: 'Health', icon: 'fitness', color: '#4CD964' },
    { name: 'Entertainment', icon: 'film', color: '#FF9500' },
    { name: 'Education', icon: 'school', color: '#5AC8FA' },
    { name: 'Bills', icon: 'receipt', color: '#007AFF' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
  ]);
  const [incomeCategories, setIncomeCategories] = useState([
    { name: 'Salary', icon: 'cash', color: '#4CD964' },
    { name: 'Investments', icon: 'trending-up', color: '#007AFF' },
    { name: 'Freelance', icon: 'briefcase', color: '#5856D6' },
    { name: 'Gifts', icon: 'gift', color: '#FF2D55' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
  ]);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      console.log('Starting to fetch user data...');
      
      const profile = await getUserProfile();
      console.log('Profile data:', profile);
      
      // Update the user data with the profile information
      setUserData(prev => ({
        ...prev,
        name: profile.name || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        joined: profile.joined || '',
        profilePhoto: profile.profile_photo || null,
        stats: {
          ...prev.stats,
          totalSaved: profile.total_saved || 0,
          expenseCount: profile.expense_count || 0,
          streakDays: profile.streak_days || 0
        }
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError(err.message || 'Failed to load user data');
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Failed to load user data. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedProfile = await updateUserProfile({
        first_name: editData.firstName,
        last_name: editData.lastName,
        email: editData.email
      });

      setUserData(prev => ({
        ...prev,
        ...updatedProfile,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name
      }));
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Clear any stored tokens or user data
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
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

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const saveNewCategory = (newCategory) => {
    if (activeTab === 'expense') {
      setCategories([...categories, newCategory]);
      AsyncStorage.setItem('expenseCategories', JSON.stringify([...categories, newCategory]));
    } else {
      setIncomeCategories([...incomeCategories, newCategory]);
      AsyncStorage.setItem('incomeCategories', JSON.stringify([...incomeCategories, newCategory]));
    }

    // Reset form fields
    setCustomCategoryName('');
    setSelectedIcon('');
    setSelectedColor('');

    Alert.alert(
      "Success",
      `New ${activeTab === 'expense' ? 'expense' : 'income'} category added!`,
      [{ text: "OK" }]
    );
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
      <Ionicons name="chevron-forward" size={20} color="#666666" />
    </TouchableOpacity>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.tilesContainer}>
        <TouchableOpacity
          style={styles.preferenceTile}
          onPress={() => navigation.navigate('Categories')}
        >
          <View style={styles.preferenceContent}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Categories</Text>
              <Text style={styles.preferenceSubtitle}>Manage expense and income categories</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.preferenceTile}
          onPress={() => navigation.navigate('IncomeSource')}
        >
          <View style={styles.preferenceContent}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Income Sources</Text>
              <Text style={styles.preferenceSubtitle}>Manage your income sources</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.preferenceTile}
          onPress={() => navigation.navigate('Subscription')}
        >
          <View style={styles.preferenceContent}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Manage Subscription</Text>
              <Text style={styles.preferenceSubtitle}>Manage your subscription and billing</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.preferenceTile}
          onPress={() => setBudgetPeriodModalVisible(true)}
        >
          <View style={styles.preferenceContent}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Budget Period</Text>
              <Text style={styles.preferenceSubtitle}>Set your budget period</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
                <View style={styles.profileImageContainer}>
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
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userData.firstName} {userData.lastName}</Text>
                  <Text style={styles.profileEmail}>{userData.email}</Text>
                  <Text style={styles.profileJoined}>Member since 2025</Text>
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

          {/* Preferences Section */}
          {renderPreferencesSection()}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

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
                <PaperTextInput
                  style={styles.input}
                  value={editData.firstName}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, firstName: text }))}
                  mode="outlined"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <PaperTextInput
                  style={styles.input}
                  value={editData.lastName}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, lastName: text }))}
                  mode="outlined"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <PaperTextInput
                  style={styles.input}
                  value={editData.email}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
                  mode="outlined"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
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

        {/* Budget Period Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={budgetPeriodModalVisible}
          onRequestClose={() => setBudgetPeriodModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Budget Period</Text>
                <TouchableOpacity onPress={() => setBudgetPeriodModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView>
                <TouchableOpacity
                  style={styles.periodOption}
                  onPress={() => handleBudgetPeriodChange('week')}
                >
                  <View style={styles.periodOptionLeft}>
                    <View style={styles.periodIconContainer}>
                      <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.periodOptionText}>Weekly</Text>
                  </View>

                  {budgetPeriod === 'week' && (
                    <Ionicons name="checkmark-circle" size={22} color="#D26A68" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.periodOption}
                  onPress={() => handleBudgetPeriodChange('month')}
                >
                  <View style={styles.periodOptionLeft}>
                    <View style={styles.periodIconContainer}>
                      <Ionicons name="calendar" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.periodOptionText}>Monthly</Text>
                  </View>

                  {budgetPeriod === 'month' && (
                    <Ionicons name="checkmark-circle" size={22} color="#D26A68" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.periodOption}
                  onPress={() => handleBudgetPeriodChange('quarter')}
                >
                  <View style={styles.periodOptionLeft}>
                    <View style={styles.periodIconContainer}>
                      <Ionicons name="apps" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.periodOptionText}>Quarterly</Text>
                  </View>

                  {budgetPeriod === 'quarter' && (
                    <Ionicons name="checkmark-circle" size={22} color="#D26A68" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.periodOption}
                  onPress={() => handleBudgetPeriodChange('year')}
                >
                  <View style={styles.periodOptionLeft}>
                    <View style={styles.periodIconContainer}>
                      <Ionicons name="today" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.periodOptionText}>Yearly</Text>
                  </View>

                  {budgetPeriod === 'year' && (
                    <Ionicons name="checkmark-circle" size={22} color="#D26A68" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setBudgetPeriodModalVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Categories Modal */}
        <Modal
          visible={categoriesModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCategoriesModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Categories</Text>
                <TouchableOpacity onPress={() => setCategoriesModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
                  onPress={() => handleTabSwitch('expense')}
                >
                  <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
                    Expense Categories
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'income' && styles.activeTab]}
                  onPress={() => handleTabSwitch('income')}
                >
                  <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
                    Income Categories
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.categoriesList}>
                  {(activeTab === 'expense' ? categories : incomeCategories).map((category) => (
                    <View key={category.name} style={styles.categoryItem}>
                      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                        <Ionicons name={category.icon} size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.addCategoryForm}>
                  <Text style={styles.formTitle}>Add New Category</Text>
                  <PaperTextInput
                    style={styles.input}
                    placeholder="Category Name"
                    placeholderTextColor="#666666"
                    value={customCategoryName}
                    onChangeText={setCustomCategoryName}
                  />

                  <Text style={styles.formLabel}>Select Icon</Text>
                  <View style={styles.iconsGrid}>
                    {['home', 'car', 'restaurant', 'shirt', 'airplane', 'gift', 'medical', 'school'].map((icon) => (
                      <TouchableOpacity
                        key={`icon-${icon}`}
                        style={[
                          styles.iconOption,
                          selectedIcon === icon && styles.selectedIconOption
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                      >
                        <Ionicons
                          name={icon}
                          size={24}
                          color={selectedIcon === icon ? '#FFFFFF' : '#CCCCCC'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Select Color</Text>
                  <View style={styles.colorsGrid}>
                    {['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'].map((color) => (
                      <TouchableOpacity
                        key={`color-${color}`}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedColor === color && styles.selectedColorOption
                        ]}
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={saveNewCategory}
                  >
                    <Text style={styles.addButtonText}>Add Category</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
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
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#D26A68',
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
    backgroundColor: '#D26A68',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D26A68',
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
  periodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 15,
  },
  periodOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  periodOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#D26A68',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  categoriesList: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addCategoryForm: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedIconOption: {
    backgroundColor: '#D26A68',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#D26A68',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tilesContainer: {
    marginBottom: 20,
  },
  preferenceTile: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: '#D26A68',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
