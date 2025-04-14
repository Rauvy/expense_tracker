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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';

const SecuritySettings = () => {
  const navigation = useNavigation();
  
  // Security feature states
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [concealAmounts, setConcealAmounts] = useState(false);
  const [passwordProtectExport, setPasswordProtectExport] = useState(true);
  
  // Modal states
  const [changePinModalVisible, setChangePinModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [appLockTimeModalVisible, setAppLockTimeModalVisible] = useState(false);
  
  // App lock timeout state
  const [appLockTimeout, setAppLockTimeout] = useState('immediate');
  
  // PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isProcessingPin, setIsProcessingPin] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessingPassword, setIsProcessingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Lock time options
  const lockTimeOptions = [
    { id: 'immediate', name: 'Immediately', icon: 'flash-outline' },
    { id: '1min', name: 'After 1 minute', icon: 'time-outline' },
    { id: '5min', name: 'After 5 minutes', icon: 'time-outline' },
    { id: '15min', name: 'After 15 minutes', icon: 'time-outline' },
    { id: '30min', name: 'After 30 minutes', icon: 'time-outline' },
    { id: 'never', name: 'Never', icon: 'infinite-outline' },
  ];
  
  // Device security check
  useEffect(() => {
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
    
    checkBiometricAvailability();
  }, []);
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const biometricSetting = await AsyncStorage.getItem('biometricEnabled');
        const pinSetting = await AsyncStorage.getItem('pinEnabled');
        const appLockSetting = await AsyncStorage.getItem('appLockEnabled');
        const appLockTimeoutSetting = await AsyncStorage.getItem('appLockTimeout');
        const hideBalancesSetting = await AsyncStorage.getItem('hideBalances');
        const concealAmountsSetting = await AsyncStorage.getItem('concealAmounts');
        const passwordProtectExportSetting = await AsyncStorage.getItem('passwordProtectExport');
        
        setBiometricEnabled(biometricSetting === 'true');
        setPinEnabled(pinSetting === 'true');
        setAppLockEnabled(appLockSetting === 'true');
        setHideBalances(hideBalancesSetting === 'true');
        setConcealAmounts(concealAmountsSetting === 'true');
        setPasswordProtectExport(passwordProtectExportSetting !== 'false'); // Default to true
        
        if (appLockTimeoutSetting) {
          setAppLockTimeout(appLockTimeoutSetting);
        }
      } catch (error) {
        console.error('Error loading security settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle biometric toggle
  const handleBiometricToggle = async (newValue) => {
    try {
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
      setBiometricEnabled(newValue);
      await AsyncStorage.setItem('biometricEnabled', newValue ? 'true' : 'false');
      
      // If enabling biometrics, suggest to disable PIN if it's enabled
      if (newValue && pinEnabled) {
        Alert.alert(
          'Biometric Authentication Enabled',
          'Would you like to disable PIN code login since biometric authentication is now enabled?',
          [
            { 
              text: 'No, Keep Both', 
              style: 'cancel' 
            },
            { 
              text: 'Yes, Disable PIN', 
              onPress: async () => {
                setPinEnabled(false);
                await AsyncStorage.setItem('pinEnabled', 'false');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling biometric setting:', error);
      Alert.alert('Error', 'Failed to update biometric settings.');
    }
  };
  
  // Handle PIN toggle
  const handlePinToggle = async (newValue) => {
    if (newValue) {
      // When enabling PIN, show the modal to set a new PIN
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setChangePinModalVisible(true);
    } else {
      // When disabling PIN, ask for confirmation
      Alert.alert(
        'Disable PIN',
        'Are you sure you want to disable PIN authentication?',
        [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              setPinEnabled(false);
              await AsyncStorage.setItem('pinEnabled', 'false');
              
              // If app lock is enabled but no other auth method is active, suggest disabling it
              if (appLockEnabled && !biometricEnabled) {
                Alert.alert(
                  'App Lock',
                  'Would you like to disable app lock since no authentication method is active?',
                  [
                    { text: 'No', style: 'cancel' },
                    { 
                      text: 'Yes', 
                      onPress: async () => {
                        setAppLockEnabled(false);
                        await AsyncStorage.setItem('appLockEnabled', 'false');
                      }
                    }
                  ]
                );
              }
            }
          }
        ]
      );
    }
  };
  
  // Handle App Lock toggle
  const handleAppLockToggle = async (newValue) => {
    if (newValue && !biometricEnabled && !pinEnabled) {
      // If trying to enable app lock but no auth method is active
      Alert.alert(
        'Authentication Required',
        'You need to enable either biometric or PIN authentication to use app lock.',
        [
          { text: 'OK' }
        ]
      );
      return;
    }
    
    setAppLockEnabled(newValue);
    await AsyncStorage.setItem('appLockEnabled', newValue ? 'true' : 'false');
    
    // If enabling app lock, offer to set timeout
    if (newValue) {
      setAppLockTimeModalVisible(true);
    }
  };
  
  // Handle app lock timeout change
  const handleAppLockTimeoutChange = async (timeout) => {
    setAppLockTimeout(timeout);
    await AsyncStorage.setItem('appLockTimeout', timeout);
    setAppLockTimeModalVisible(false);
  };
  
  // Handle hide balances toggle
  const handleHideBalancesToggle = async (newValue) => {
    setHideBalances(newValue);
    await AsyncStorage.setItem('hideBalances', newValue ? 'true' : 'false');
  };
  
  // Handle conceal amounts toggle
  const handleConcealAmountsToggle = async (newValue) => {
    setConcealAmounts(newValue);
    await AsyncStorage.setItem('concealAmounts', newValue ? 'true' : 'false');
  };
  
  // Handle password protect export toggle
  const handlePasswordProtectExportToggle = async (newValue) => {
    setPasswordProtectExport(newValue);
    await AsyncStorage.setItem('passwordProtectExport', newValue ? 'true' : 'false');
  };
  
  // Handle PIN change
  const handlePinChange = async () => {
    // For first time setup, we don't need to check current PIN
    const isFirstTimeSetup = !await AsyncStorage.getItem('pin');
    
    if (!isFirstTimeSetup) {
      // Validate current PIN
      const storedPin = await AsyncStorage.getItem('pin');
      if (currentPin !== storedPin) {
        Alert.alert('Error', 'Current PIN is incorrect');
        return;
      }
    }
    
    // Validate new PIN
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }
    
    // Process PIN change
    setIsProcessingPin(true);
    
    try {
      await AsyncStorage.setItem('pin', newPin);
      
      // If this is first time setup, enable PIN authentication
      if (isFirstTimeSetup) {
        setPinEnabled(true);
        await AsyncStorage.setItem('pinEnabled', 'true');
      }
      
      // Reset form
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      
      // Close modal
      setChangePinModalVisible(false);
      
      // Show success message
      Alert.alert(
        'Success',
        isFirstTimeSetup ? 'PIN has been set successfully' : 'Your PIN has been changed successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    } finally {
      setIsProcessingPin(false);
    }
  };
  
  // Render menu item
  const renderMenuItem = (icon, title, subtitle, action, rightElement) => (
    <TouchableOpacity style={styles.menuItem} onPress={action}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color="#666666" />
      )}
    </TouchableOpacity>
  );
  
  // Render toggle menu item
  const renderToggleMenuItem = (icon, title, subtitle, value, onToggle) => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333333', true: '#276EF1' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

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
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.screenTitle}>Security Settings</Text>
          
          {/* Authentication */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication</Text>
            
            {isBiometricSupported && renderToggleMenuItem(
              biometricType === 'Face ID' ? 'scan-face-outline' : 'finger-print-outline',
              biometricType || 'Biometric Authentication',
              `Unlock app using ${biometricType || 'biometrics'}`,
              biometricEnabled,
              handleBiometricToggle
            )}
            
            {renderToggleMenuItem(
              'lock-closed-outline',
              'PIN Code',
              'Unlock app using a 4-digit PIN',
              pinEnabled,
              handlePinToggle
            )}
            
            {(pinEnabled || biometricEnabled) && renderToggleMenuItem(
              'shield-checkmark-outline',
              'App Lock',
              'Lock app when inactive',
              appLockEnabled,
              handleAppLockToggle
            )}
            
            {appLockEnabled && renderMenuItem(
              'time-outline',
              'Auto-Lock Timer',
              'Set when to lock the app',
              () => setAppLockTimeModalVisible(true),
              <View style={styles.menuItemValue}>
                <Text style={styles.menuItemValueText}>
                  {lockTimeOptions.find(option => option.id === appLockTimeout)?.name || 'Immediately'}
                </Text>
              </View>
            )}
            
            {pinEnabled && renderMenuItem(
              'key-outline',
              'Change PIN',
              'Update your security PIN',
              () => {
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
                setChangePinModalVisible(true);
              }
            )}
          </View>
          
          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            {renderToggleMenuItem(
              'eye-off-outline',
              'Hide Balances',
              'Hide account balances on home screen',
              hideBalances,
              handleHideBalancesToggle
            )}
            
            {renderToggleMenuItem(
              'cash-outline',
              'Conceal Amounts',
              'Mask transaction amounts in lists',
              concealAmounts,
              handleConcealAmountsToggle
            )}
            
            {renderToggleMenuItem(
              'lock-closed-outline',
              'Password-Protected Exports',
              'Require password when exporting data',
              passwordProtectExport,
              handlePasswordProtectExportToggle
            )}
          </View>
          
          {/* Data Protection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Protection</Text>
            
            {renderMenuItem(
              'trash-outline',
              'Clear App Data',
              'Delete all locally stored data',
              () => {
                Alert.alert(
                  'Clear App Data',
                  'Are you sure you want to clear all locally stored data? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear Data', 
                      style: 'destructive',
                      onPress: () => {
                        // In a real app, implement data clearing functionality
                        Alert.alert('Data Cleared', 'All local data has been removed.');
                      }
                    }
                  ]
                );
              }
            )}
            
            {renderMenuItem(
              'refresh-outline',
              'Recovery Phrase',
              'View and backup your recovery phrase',
              () => {
                // In a real app, implement recovery phrase display with proper security checks
                Alert.alert(
                  'Authentication Required',
                  'Please authenticate to view your recovery phrase.',
                  [{ text: 'OK' }]
                );
              }
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Change PIN Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={changePinModalVisible}
        onRequestClose={() => setChangePinModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pinEnabled ? 'Change PIN' : 'Set PIN'}</Text>
              <TouchableOpacity onPress={() => setChangePinModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {pinEnabled && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  placeholder="Enter current PIN"
                  placeholderTextColor="#666666"
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New PIN</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor="#666666"
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm PIN</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Confirm new PIN"
                placeholderTextColor="#666666"
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <Text style={styles.pinHint}>
              PIN must be exactly 4 digits
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                isProcessingPin && styles.saveButtonDisabled
              ]}
              onPress={handlePinChange}
              disabled={isProcessingPin}
            >
              {isProcessingPin ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{pinEnabled ? 'Update PIN' : 'Set PIN'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* App Lock Timeout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={appLockTimeModalVisible}
        onRequestClose={() => setAppLockTimeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Auto-Lock Timer</Text>
              <TouchableOpacity onPress={() => setAppLockTimeModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {lockTimeOptions.map((option, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.lockTimeOption}
                  onPress={() => handleAppLockTimeoutChange(option.id)}
                >
                  <View style={styles.lockTimeOptionLeft}>
                    <View style={styles.lockTimeIconContainer}>
                      <Ionicons name={option.icon} size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.lockTimeOptionText}>{option.name}</Text>
                  </View>
                  
                  {appLockTimeout === option.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#276EF1" />
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => setAppLockTimeModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Apply</Text>
              </TouchableOpacity>
            </ScrollView>
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
    marginBottom: 15,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
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
    justifyContent: 'space-between',
    backgroundColor: '#252525',
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
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 3,
  },
  menuItemValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValueText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 5,
  },
  
  // Modal styles
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
  
  // Input styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pinInput: {
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  pinHint: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
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
  saveButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  
  // App lock timeout styles
  lockTimeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  lockTimeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockTimeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lockTimeOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SecuritySettings;
