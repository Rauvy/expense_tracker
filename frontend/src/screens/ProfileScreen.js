import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
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

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedExpenseCategories = await AsyncStorage.getItem('expenseCategories');
        const savedIncomeCategories = await AsyncStorage.getItem('incomeCategories');
        
        if (savedExpenseCategories) {
          setCategories(JSON.parse(savedExpenseCategories));
        }
        
        if (savedIncomeCategories) {
          setIncomeCategories(JSON.parse(savedIncomeCategories));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Load budget period on mount
  useEffect(() => {
    const loadBudgetPeriod = async () => {
      try {
        const savedPeriod = await AsyncStorage.getItem('budgetPeriod');
        if (savedPeriod) {
          setBudgetPeriod(savedPeriod);
        }
      } catch (error) {
        console.error('Error loading budget period:', error);
      }
    };
    
    loadBudgetPeriod();
  }, []);

  const handleBudgetPeriodChange = async (period) => {
    try {
      setBudgetPeriod(period);
      await AsyncStorage.setItem('budgetPeriod', period);
      setBudgetPeriodModalVisible(false);
    } catch (error) {
      console.error('Error saving budget period:', error);
      Alert.alert('Error', 'Failed to save budget period');
    }
  };

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
          
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            {renderMenuItem(
              'card-outline',
              'Payment Methods',
              'Manage your payment methods',
              () => navigation.navigate('PaymentSettings')
            )}
            
            {renderMenuItem(
              'list-outline',
              'Categories',
              'Customize your expense and income categories',
              () => navigation.navigate('Categories')
            )}
            
            {renderMenuItem(
              'cash-outline',
              'Income Sources',
              'Manage your income sources',
              () => navigation.navigate('IncomeSource')
            )}
            
            {renderMenuItem(
              'calendar-outline',
              'Budget Period',
              `Current: ${budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)}`,
              () => setBudgetPeriodModalVisible(true)
            )}
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
                    <Ionicons name="checkmark-circle" size={22} color="#276EF1" />
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
                    <Ionicons name="checkmark-circle" size={22} color="#276EF1" />
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
                    <Ionicons name="checkmark-circle" size={22} color="#276EF1" />
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
                    <Ionicons name="checkmark-circle" size={22} color="#276EF1" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => setBudgetPeriodModalVisible(false)}
                >
                  <Text style={styles.saveButtonText}>Apply</Text>
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
                  <TextInput
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
  periodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  periodOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  periodOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    borderBottomColor: '#276EF1',
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
    backgroundColor: '#276EF1',
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
    backgroundColor: '#276EF1',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 