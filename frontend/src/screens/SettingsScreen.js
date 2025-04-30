import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../services/authService';
import { useTheme } from '../theme/ThemeProvider';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { changeTheme, mode } = useTheme();
  
  const { theme } = useTheme();
  const styles = useThemedStyles(theme);
  
  // General Settings States
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(false);
  
  // Modal Visibility States
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [budgetPeriodModalVisible, setBudgetPeriodModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  
  // Language and Theme states
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [currentTheme, setCurrentTheme] = useState('auto');
  
  // Budget period state
  const [budgetPeriod, setBudgetPeriod] = useState('month');
  
  // Available languages and themes
  const availableLanguages = ['English'];
  const availableThemes = [
    { id: 'auto', name: 'System Default', icon: 'phone-portrait-outline' },
    { id: 'light', name: 'Light Mode', icon: 'sunny-outline' },
    { id: 'dark', name: 'Dark Mode', icon: 'moon-outline' }
  ];
  
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
  
  // Available icons and colors for category customization
  const availableIcons = [
    'fast-food', 'cart', 'car', 'fitness', 'film', 'school', 'receipt', 
    'home', 'airplane', 'gift', 'cash', 'briefcase', 'card', 'pricetag', 
    'cafe', 'beer', 'medkit', 'basketball', 'book', 'build', 'shirt', 
    'phone-portrait', 'umbrella', 'wifi', 'game-controller', 'bicycle',
    'bus', 'planet', 'paw', 'musical-notes', 'brush', 'ellipsis-horizontal'
  ];
  const availableColors = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', 
    '#5856D6', '#FF2D55', '#8E8E93', '#34C759', '#32ADE6', '#AF52DE'
  ];
  
  // For category management
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
  
  // Load saved categories on component mount
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
  
  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Biometric states
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  
  // Notification settings
  const [expenseAlerts, setExpenseAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  
  // Password change states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessingPasswordChange, setIsProcessingPasswordChange] = useState(false);
  
  // Load categories and check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSetting();
  }, []);
  
  // Check if device supports biometric authentication
  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      if (compatible) {
        // Determine the type of biometric available
        const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        // Set the biometric type prioritizing Face ID
        if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };
  
  // Load biometric setting from AsyncStorage
  const loadBiometricSetting = async () => {
    try {
      const value = await AsyncStorage.getItem('biometricEnabled');
      setBiometricLoginEnabled(value === 'true');
    } catch (error) {
      console.error('Error loading biometric setting:', error);
    }
  };
  
  // Handle biometric authentication toggle
  const handleBiometricToggle = async (newValue) => {
    try {
      // If enabling biometrics, check if device supports it
      if (newValue) {
        if (!isBiometricSupported) {
          Alert.alert(
            'Not Supported',
            'Biometric authentication is not supported on this device.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Verify if enrolled
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          Alert.alert(
            `No ${biometricType || 'Biometrics'} Found`,
            `Please set up ${biometricType || 'biometric authentication'} in your device settings first.`,
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Verify current user with biometrics before enabling
        const { success } = await LocalAuthentication.authenticateAsync({
          promptMessage: `Authenticate to enable ${biometricType || 'biometric'} login`,
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
        
        if (!success) {
          return; // User cancelled or failed authentication
        }
      }
      
      // Update setting
      setBiometricLoginEnabled(newValue);
      await AsyncStorage.setItem('biometricEnabled', newValue ? 'true' : 'false');
      
      // If disabling, clear stored credentials
      if (!newValue) {
        await AsyncStorage.removeItem('storedUsername');
        await AsyncStorage.removeItem('storedPassword');
      }
    } catch (error) {
      console.error('Error toggling biometric setting:', error);
      Alert.alert('Error', 'Failed to update biometric settings.');
    }
  };
  
  // Password change handler
  const handleChangePassword = () => {
    // Validate inputs
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    // Simulate password change process
    setIsProcessingPasswordChange(true);
    
    // In a real app, you would make an API call to change the password
    setTimeout(() => {
      setIsProcessingPasswordChange(false);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Close modal
      setChangePasswordModalVisible(false);
      
      // Show success message
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK' }]
      );
    }, 1500);
  };
  
  // Handle theme change
  const handleThemeChange = (themeId) => {
    changeTheme(themeId); 
    setCurrentTheme(themeId);
    setThemeModalVisible(false);
  };
  
  // Handle language change
  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    // In a real app, you would apply the language here
    // and save the preference to AsyncStorage
    AsyncStorage.setItem('language', language);
    setLanguageModalVisible(false);
  };

  // Handle budget period change
  const handleBudgetPeriodChange = async (period) => {
    setBudgetPeriod(period);
    await AsyncStorage.setItem('budgetPeriod', period);
    setBudgetPeriodModalVisible(false);
  };
  
  // Load preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Set the theme mode from context instead of AsyncStorage
        setCurrentTheme(mode);
        
        const savedLanguage = await AsyncStorage.getItem('language');
        const savedBudgetPeriod = await AsyncStorage.getItem('budgetPeriod');
        
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
        
        if (savedBudgetPeriod) {
          setBudgetPeriod(savedBudgetPeriod);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, [mode]); // Add mode as a dependency so it updates when changed
  
  // Render menu item
  const renderMenuItem = (icon, title, subtitle, action, rightElement) => (
    <TouchableOpacity style={styles.menuItem} onPress={action}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={22} color={theme.textPrimary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      )}
    </TouchableOpacity>
  );

  // Delete Account States
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    // Validate inputs
    if (!deleteAccountPassword.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    if (deleteConfirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // here we need to call api to delete account
      setTimeout(async () => {
        try {
          // Call logout from authService
          await logout();
          
          // Reset form
          setDeleteAccountPassword('');
          setDeleteConfirmText('');
          
          // Close modal
          setDeleteAccountModalVisible(false);
          setIsDeletingAccount(false);
          
          // Navigate to login screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          
          // Show success message
          Alert.alert(
            'Account Deleted',
            'Your account has been permanently deleted',
            [{ text: 'OK' }]
          );
        } catch (error) {
          console.error('Error deleting account:', error);
          Alert.alert('Error', 'Failed to delete account. Please try again.');
          setIsDeletingAccount(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screenPadding}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          
          {/* General Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            {renderMenuItem('person-outline', 'Profile', 'Manage your profile information', () => navigation.navigate('ProfileSettings'))}
            {renderMenuItem('notifications-outline', 'Notifications', 'Manage your notification preferences', () => setNotificationSettingsVisible(true))}
            {renderMenuItem('language-outline', 'Language', 'Change app language', () => setLanguageModalVisible(true), 
              <View style={styles.menuItemValue}>
                <Text style={styles.menuItemValueText}>{currentLanguage}</Text>
              </View>
            )}
            {renderMenuItem('moon-outline', 'Theme', 'Change app theme', () => setThemeModalVisible(true), 
              <View style={styles.menuItemValue}>
                <Text style={styles.menuItemValueText}>
                  {availableThemes.find(themeOpt => themeOpt.id === currentTheme)?.name || 'System Default'}
                </Text>
              </View>
            )}
          </View>

          {/* Data & Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            {renderMenuItem('shield-checkmark-outline', 'Security', 'Manage your security settings', () => navigation.navigate('SecuritySettings'))}
            {renderMenuItem('cloud-download-outline', 'Backup', 'Backup your data', () => navigation.navigate('BackUpSettings'))}
            {renderMenuItem('trash-outline', 'Delete Account', 'Permanently delete your account', () => setDeleteAccountModalVisible(true))}
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            {renderMenuItem('help-circle-outline', 'Help Center', 'Get help with the app', () => {})}
            {renderMenuItem('mail-outline', 'Contact Us', 'Send us a message', () => {})}
            {renderMenuItem('information-circle-outline', 'About', 'Learn more about the app', () => {})}
          </View>
        </View>
      </ScrollView>
      
      {/* Notification Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationSettingsVisible}
        onRequestClose={() => setNotificationSettingsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setNotificationSettingsVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.notificationSectionHeader}>
                <Ionicons name="notifications" size={22} color={theme.accent} />
                <Text style={styles.notificationSectionTitle}>Transaction Alerts</Text>
              </View>
              
              <View style={styles.notificationOption}>
                <View style={styles.notificationOptionInfo}>
                  <Text style={styles.notificationOptionTitle}>Expense Alerts</Text>
                  <Text style={styles.notificationOptionDesc}>Receive alerts for new expenses</Text>
                </View>
                <Switch
                  value={expenseAlerts}
                  onValueChange={setExpenseAlerts}
                  trackColor={{ false: theme.inputBorder, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
              
              <View style={styles.notificationOption}>
                <View style={styles.notificationOptionInfo}>
                  <Text style={styles.notificationOptionTitle}>Budget Alerts</Text>
                  <Text style={styles.notificationOptionDesc}>Get notified when nearing budget limits</Text>
                </View>
                <Switch
                  value={budgetAlerts}
                  onValueChange={setBudgetAlerts}
                  trackColor={{ false: theme.inputBorder, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
              
              <View style={styles.notificationSectionHeader}>
                <Ionicons name="document-text" size={22} color={theme.accent} />
                <Text style={styles.notificationSectionTitle}>Reports & Summaries</Text>
              </View>
              
              <View style={styles.notificationOption}>
                <View style={styles.notificationOptionInfo}>
                  <Text style={styles.notificationOptionTitle}>Weekly Report</Text>
                  <Text style={styles.notificationOptionDesc}>Receive weekly spending summaries</Text>
                </View>
                <Switch
                  value={weeklyReports}
                  onValueChange={setWeeklyReports}
                  trackColor={{ false: theme.inputBorder, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
              
              <View style={styles.notificationSectionHeader}>
                <Ionicons name="alarm" size={22} color={theme.accent} />
                <Text style={styles.notificationSectionTitle}>Reminders</Text>
              </View>
              
              <View style={styles.notificationOption}>
                <View style={styles.notificationOptionInfo}>
                  <Text style={styles.notificationOptionTitle}>Bill Reminders</Text>
                  <Text style={styles.notificationOptionDesc}>Get reminded about upcoming bills</Text>
                </View>
                <Switch
                  value={reminderAlerts}
                  onValueChange={setReminderAlerts}
                  trackColor={{ false: theme.inputBorder, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => setNotificationSettingsVisible(false)}
              >
                <Text style={styles.saveButtonText}>Save Preferences</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Categories Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoriesModalVisible}
        onRequestClose={() => setCategoriesModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Categories</Text>
              <TouchableOpacity onPress={() => setCategoriesModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[
                  styles.tabButton, 
                  activeTab === 'expense' && styles.activeTabButton
                ]}
                onPress={() => handleTabSwitch('expense')}
              >
                <Text style={[
                  styles.tabButtonText, 
                  activeTab === 'expense' && styles.activeTabText
                ]}>
                  Expense Categories
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.tabButton, 
                  activeTab === 'income' && styles.activeTabButton
                ]}
                onPress={() => handleTabSwitch('income')}
              >
                <Text style={[
                  styles.tabButtonText, 
                  activeTab === 'income' && styles.activeTabText
                ]}>
                  Income Categories
                </Text>
              </TouchableOpacity>
            </View>

            {/* Categories Display */}
            <ScrollView style={styles.categoriesContainer}>
              <View style={styles.categoriesGrid}>
                {(activeTab === 'expense' ? categories : incomeCategories).map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon} size={24} color={theme.textPrimary} />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Add New Category Form */}
            <View style={styles.addCategoryForm}>
              <Text style={styles.formLabel}>Add New Category</Text>
              
              {/* Name Input */}
              <TextInput
                style={styles.textInput}
                placeholder="Category Name"
                value={customCategoryName}
                onChangeText={setCustomCategoryName}
              />
              
              {/* Icon Selection */}
              <Text style={styles.sectionLabel}>Select Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconsContainer}>
                {availableIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.selectedIconOption
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons name={icon} size={24} color={selectedIcon === icon ? theme.textPrimary : theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Color Selection */}
              <Text style={styles.sectionLabel}>Select Color</Text>
              <View style={styles.colorsContainer}>
                {availableColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              
              {/* Add Button */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!customCategoryName || !selectedIcon || !selectedColor) && styles.disabledButton
                ]}
                disabled={!customCategoryName || !selectedIcon || !selectedColor}
                onPress={() => {
                  const newCategory = {
                    name: customCategoryName,
                    icon: selectedIcon,
                    color: selectedColor
                  };
                  saveNewCategory(newCategory);
                }}
              >
                <Text style={styles.addButtonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity 
                onPress={() => {
                  setChangePasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.placeholderTextColor}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons 
                    name={showCurrentPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={theme.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.placeholderTextColor}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons 
                    name={showNewPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={theme.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Password must be at least 8 characters long
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.placeholderTextColor}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={theme.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                isProcessingPasswordChange && styles.saveButtonDisabled
              ]}
              onPress={handleChangePassword}
              disabled={isProcessingPasswordChange}
            >
              {isProcessingPasswordChange ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => {
                setChangePasswordModalVisible(false);
                // In a real app, navigate to forgot password screen or trigger email
                Alert.alert(
                  'Forgot Password',
                  'A password reset link will be sent to your email address',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {availableLanguages.map((language, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleLanguageChange(language)}
                >
                  <Text style={styles.optionText}>{language}</Text>
                  {currentLanguage === language && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                  )}
                </TouchableOpacity>
              ))}
              
              <Text style={styles.comingSoonText}>More languages coming soon</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Theme Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {availableThemes.map((themeOption, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.themeOption,
                    currentTheme === themeOption.id && styles.selectedThemeOption
                  ]}
                  onPress={() => handleThemeChange(themeOption.id)}
                >
                  <View style={styles.themeOptionLeft}>
                    <View style={[
                      styles.themeIconContainer,
                      currentTheme === themeOption.id && { backgroundColor: theme.accent }
                    ]}>
                      <Ionicons 
                        name={themeOption.icon} 
                        size={22} 
                        color={currentTheme === themeOption.id ? theme.textPrimary : theme.textSecondary} 
                      />
                    </View>
                    <Text style={styles.themeOptionText}>{themeOption.name}</Text>
                  </View>
                  
                  {currentTheme === themeOption.id && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Budget Period Selection Modal */}
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
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handleBudgetPeriodChange('week')}
              >
                <View style={styles.periodOptionLeft}>
                  <View style={styles.periodIconContainer}>
                    <Ionicons name="calendar-outline" size={22} color={theme.textPrimary} />
                  </View>
                  <Text style={styles.periodOptionText}>Weekly</Text>
                </View>
                
                {budgetPeriod === 'week' && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handleBudgetPeriodChange('month')}
              >
                <View style={styles.periodOptionLeft}>
                  <View style={styles.periodIconContainer}>
                    <Ionicons name="calendar" size={22} color={theme.textPrimary} />
                  </View>
                  <Text style={styles.periodOptionText}>Monthly</Text>
                </View>
                
                {budgetPeriod === 'month' && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handleBudgetPeriodChange('quarter')}
              >
                <View style={styles.periodOptionLeft}>
                  <View style={styles.periodIconContainer}>
                    <Ionicons name="apps" size={22} color={theme.textPrimary} />
                  </View>
                  <Text style={styles.periodOptionText}>Quarterly</Text>
                </View>
                
                {budgetPeriod === 'quarter' && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handleBudgetPeriodChange('year')}
              >
                <View style={styles.periodOptionLeft}>
                  <View style={styles.periodIconContainer}>
                    <Ionicons name="today" size={22} color={theme.textPrimary} />
                  </View>
                  <Text style={styles.periodOptionText}>Yearly</Text>
                </View>
                
                {budgetPeriod === 'year' && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
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
      
      {/* Delete Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteAccountModalVisible}
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <TouchableOpacity 
                onPress={() => {
                  setDeleteAccountModalVisible(false);
                  setDeleteAccountPassword('');
                  setDeleteConfirmText('');
                }}
              >
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.deleteWarningContainer}>
              <Ionicons name="warning" size={40} color={theme.error} style={styles.warningIcon} />
              <Text style={styles.deleteWarningText}>
                Warning: This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Your Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={deleteAccountPassword}
                  onChangeText={setDeleteAccountPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.placeholderTextColor}
                  secureTextEntry={!showDeletePassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowDeletePassword(!showDeletePassword)}
                >
                  <Ionicons 
                    name={showDeletePassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={theme.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type DELETE to confirm</Text>
              <TextInput
                style={[styles.textInput, { marginTop: 10 }]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type DELETE in all caps"
                placeholderTextColor={theme.placeholderTextColor}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.deleteButton,
                (deleteConfirmText !== 'DELETE' || !deleteAccountPassword || isDeletingAccount) && 
                styles.deleteButtonDisabled
              ]}
              onPress={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || !deleteAccountPassword || isDeletingAccount}
            >
              {isDeletingAccount ? (
                <ActivityIndicator color={theme.textPrimary} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete My Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const useThemedStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  screenPadding: {
    padding: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.cardBackground,
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
    marginBottom: 15,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.textPrimary,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: theme.textPrimary,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 3,
  },
  versionText: {
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: 12,
    marginBottom: 20,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.modalOverlay,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
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
    color: theme.textPrimary,
    fontWeight: 'bold',
  },
  
  // Notification settings styles
  notificationSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.inputBorder,
  },
  notificationSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginLeft: 10,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  notificationOptionInfo: {
    flex: 1,
  },
  notificationOptionTitle: {
    fontSize: 16,
    color: theme.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationOptionDesc: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  
  // Password change styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    color: theme.textPrimary,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: theme.inactive,
    opacity: 0.7,
  },
  forgotPasswordLink: {
    alignSelf: 'center',
    marginTop: 15,
    padding: 10,
  },
  forgotPasswordText: {
    color: theme.accent,
    fontSize: 14,
  },
  
  // Categories Modal Styles
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.inputBackground,
    marginHorizontal: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: theme.accent,
  },
  tabButtonText: {
    color: theme.textPrimary,
    fontWeight: '500',
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flex: 1,
    marginTop: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    paddingTop: 10,
    marginBottom: 10,
  },
  categoryItem: {
    width: '25%',
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    color: theme.textPrimary,
    fontSize: 12,
    textAlign: 'center',
    width: '80%',
  },
  addCategoryForm: {
    marginTop: 15,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.inputBorder,
    paddingHorizontal: 5,
  },
  formLabel: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    padding: 15,
    color: theme.textPrimary,
    fontSize: 16,
  },
  sectionLabel: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedIconOption: {
    borderColor: theme.accent,
    borderWidth: 2,
    backgroundColor: theme.accent,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedColorOption: {
    borderColor: theme.textPrimary,
    borderWidth: 2,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: theme.inactive,
    opacity: 0.7,
  },
  addButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValueText: {
    color: theme.textPrimary,
    fontSize: 14,
    marginRight: 5,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  optionText: {
    color: theme.textPrimary,
    fontSize: 16,
  },
  comingSoonText: {
    color: theme.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  themeOptionText: {
    color: theme.textPrimary,
    fontSize: 16,
  },
  periodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
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
    backgroundColor: theme.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  periodOptionText: {
    color: theme.textPrimary,
    fontSize: 16,
  },
  
  // Delete Account Modal Styles
  deleteWarningContainer: {
    backgroundColor: theme.deleteWarningBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: 10,
  },
  deleteWarningText: {
    color: theme.textPrimary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: theme.error,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonDisabled: {
    backgroundColor: theme.inactive,
    opacity: 0.7,
  },
  selectedThemeOption: {
    borderColor: theme.accent,
    borderWidth: 1,
  },
});

export default SettingsScreen;
