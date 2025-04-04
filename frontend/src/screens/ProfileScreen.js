import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock user data
const userData = {
  name: 'John Doe',
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
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.screenPadding}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
              <Text style={styles.sectionTitle}>Profile</Text>
              <Ionicons name="person-circle" size={24} color="#276EF1" />
            </View>
          </View>
          
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              {userData.profilePhoto ? (
                <Image source={{ uri: userData.profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <Text style={styles.profileInitials}>
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
              )}
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
                <Text style={styles.profileJoined}>Member since {userData.joined}</Text>
              </View>
              
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={18} color="#FFFFFF" />
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
          
          {/* Settings Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            {renderMenuItem(
              'moon',
              'Dark Mode',
              'Switch between light and dark themes',
              () => setDarkMode(!darkMode),
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#333333', true: '#276EF1' }}
                thumbColor="#FFFFFF"
              />
            )}
            
            {renderMenuItem(
              'notifications',
              'Notifications',
              'Get updates on your expenses',
              () => setNotifications(!notifications),
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#333333', true: '#276EF1' }}
                thumbColor="#FFFFFF"
              />
            )}
            
            {renderMenuItem(
              'finger-print',
              'Biometric Login',
              'Securely login with biometrics',
              () => setBiometrics(!biometrics),
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: '#333333', true: '#276EF1' }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
          
          {/* Preferences Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            {renderMenuItem(
              'card',
              'Payment Methods',
              'Manage your payment options',
              () => {}
            )}
            
            {renderMenuItem(
              'pricetags',
              'Categories',
              'Customize expense categories',
              () => {}
            )}
            
            {renderMenuItem(
              'wallet',
              'Budget Goals',
              'Set and manage financial goals',
              () => {}
            )}
            
            {renderMenuItem(
              'sync',
              'Sync Data',
              'Sync with cloud services',
              () => {}
            )}
          </View>
          
          {/* Data & Privacy Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            
            {renderMenuItem(
              'cloud-download',
              'Export Data',
              'Download your expense history',
              () => {}
            )}
            
            {renderMenuItem(
              'shield-checkmark',
              'Privacy Settings',
              'Manage your privacy preferences',
              () => {}
            )}
            
            {renderMenuItem(
              'trash',
              'Delete Account',
              'Permanently delete your account',
              () => {},
              <Ionicons name="warning" size={20} color="#FF3B30" />
            )}
          </View>
          
          {/* Support Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            {renderMenuItem(
              'help-circle',
              'Help Center',
              'Get help with the app',
              () => {}
            )}
            
            {renderMenuItem(
              'chatbubble-ellipses',
              'Contact Us',
              'Reach out to our support team',
              () => {}
            )}
            
            {renderMenuItem(
              'star',
              'Rate the App',
              'Share your feedback',
              () => {}
            )}
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#FFFFFF" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          {/* App Version */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenPadding: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 3,
  },
  profileJoined: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
    marginBottom: 20,
  },
});

export default ProfileScreen; 