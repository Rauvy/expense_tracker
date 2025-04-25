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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { login, logout } from '../services/authService';
import api from '../services/apiService';
import { useTheme } from '../theme/ThemeProvider';

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { theme } = useTheme();
  const styles = useThemedStyles(theme);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication);
    }
  }, [response]);
  

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      // Step 1: Login and get tokens (tokens are saved in authService)
      const { access_token } = await login({ email, password });
  
      // Step 2: Immediately hit the protected route
      const res = await api.get('/account/me');
      console.log('✅ Logged in user:', res.data);
  
      // Step 3: Navigate to main app
      navigation.replace('MainApp');
    } catch (error) {
      console.log('Login error:', error.response?.data, error.message);
  
      const detail = error.response?.data?.detail;

      if (typeof detail === 'string') {
        setError(detail);
      } else if (typeof detail === 'object' && detail?.msg) {
        setError(detail.msg);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleGoogleSignIn = async (authentication) => {
    if (!authentication) return;

    setIsLoading(true);
    setError('');

    try {
      // Here you would typically send the Google token to your backend
      // for verification and user creation/login
      const response = await login({
        token: authentication.accessToken,
        provider: 'google'
      });
      
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout failed', error.response?.data?.detail || 'Please try again.');
    }
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
              <Text style={styles.subtitle}>Login to your account</Text>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  placeholderTextColor={theme.placeholderTextColor}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={theme.placeholderTextColor}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  editable={!isLoading}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.textPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity 
                style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                onPress={() => promptAsync()}
                disabled={isLoading}
              >
                <Ionicons 
                  name="logo-google" 
                  size={24} 
                  color={theme.textPrimary} 
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
              
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Signup')}
                  disabled={isLoading}
                >
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

const useThemedStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: theme.error,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: theme.textPrimary,
    textAlign: 'center',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.inputBackground,
    borderRadius: 10,
    padding: 15,
    color: theme.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.inputBorder,
  },
  dividerText: {
    color: theme.textSecondary,
    marginHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    borderColor: theme.accent,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: theme.error,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 