import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    // Check if biometric authentication is available on this device
    checkBiometricAvailability();
    // Check if user has enabled biometric login
    checkBiometricEnabled();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      if (compatible) {
        const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        // Set the biometric type prioritizing Face ID
        if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
        
        const enrolledTypes = await LocalAuthentication.isEnrolledAsync();
        console.log('Biometric types enrolled:', enrolledTypes);
        
        if (!enrolledTypes) {
          setShowPasswordFields(true);
        }
      } else {
        setShowPasswordFields(true);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setShowPasswordFields(true);
    }
  };
  
  const checkBiometricEnabled = async () => {
    try {
      const value = await AsyncStorage.getItem('biometricEnabled');
      const isEnabled = value === 'true';
      setIsBiometricEnabled(isEnabled);
      
      // If biometric is not enabled, show the password fields
      if (!isEnabled) {
        setShowPasswordFields(true);
      } else {
        // If biometric is enabled, try to authenticate immediately
        setTimeout(() => {
          handleBiometricAuth();
        }, 500); // Slight delay to allow UI to render
      }
    } catch (error) {
      console.error('Error checking biometric settings:', error);
      setShowPasswordFields(true);
    }
  };

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      // If this is a successful login, store the credentials securely
      // In a real app, you would use a more secure method than AsyncStorage
      if (isBiometricEnabled) {
        storeUserCredentials();
      }
      
      navigation.replace('MainApp');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };
  
  const storeUserCredentials = async () => {
    try {
      // In a real app, you would use a more secure method like EncryptedStorage
      await AsyncStorage.setItem('storedUsername', username);
      await AsyncStorage.setItem('storedPassword', password);
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  };
  
  const retrieveUserCredentials = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('storedUsername');
      const storedPassword = await AsyncStorage.getItem('storedPassword');
      
      if (storedUsername && storedPassword) {
        setUsername(storedUsername);
        setPassword(storedPassword);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return false;
    }
  };

  const handleBiometricAuth = async () => {
    if (!isBiometricSupported) {
      setShowPasswordFields(true);
      return;
    }
    
    try {
      // Authenticate user
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: `Sign in with ${biometricType}`,
        cancelLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      
      if (success) {
        // Retrieve stored credentials and login
        const hasCredentials = await retrieveUserCredentials();
        if (hasCredentials) {
          navigation.replace('MainApp');
        } else {
          Alert.alert('Error', 'No stored credentials found. Please login with username and password first.');
          setShowPasswordFields(true);
        }
      } else {
        // User cancelled or authentication failed, show password fields
        setShowPasswordFields(true);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Authentication Error', error.message || 'Failed to authenticate');
      setShowPasswordFields(true);
    }
  };

  const renderBiometricButton = () => {
    const iconName = biometricType === 'Face ID' ? 'scan-face' : 'finger-print';
    
    return (
      <TouchableOpacity 
        style={styles.biometricAuthButton} 
        onPress={handleBiometricAuth}
      >
        <Ionicons name={iconName} size={60} color="#FFFFFF" />
        <Text style={styles.biometricAuthText}>
          Sign in with {biometricType}
        </Text>
        <TouchableOpacity 
          style={styles.usePasswordButton}
          onPress={() => setShowPasswordFields(true)}
        >
          <Text style={styles.usePasswordText}>Use Password Instead</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.title}>Expense Tracker</Text>
              <Text style={styles.subtitle}>
                {isBiometricEnabled && !showPasswordFields && biometricType 
                  ? `Sign in with ${biometricType}` 
                  : 'Login to your account'
                }
              </Text>
              
              {isBiometricSupported && isBiometricEnabled && !showPasswordFields ? (
                renderBiometricButton()
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter username"
                      placeholderTextColor="#666666"
                      value={username}
                      onChangeText={setUsername}
                      showSoftInputOnFocus={true}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      placeholderTextColor="#666666"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      showSoftInputOnFocus={true}
                    />
                  </View>
                  
                  <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                  
                  {isBiometricSupported && isBiometricEnabled && (
                    <TouchableOpacity 
                      style={styles.biometricButton}
                      onPress={handleBiometricAuth}
                    >
                      <Ionicons 
                        name={biometricType === 'Face ID' ? 'scan-face' : 'finger-print'} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.biometricButtonText}>
                        Login with {biometricType}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    padding: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#276EF1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  biometricAuthButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  biometricAuthText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  usePasswordButton: {
    padding: 10,
  },
  usePasswordText: {
    color: '#276EF1',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666666',
    fontSize: 16,
  },
  signupLink: {
    color: '#276EF1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 