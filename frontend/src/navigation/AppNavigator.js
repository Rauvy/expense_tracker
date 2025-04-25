import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/AddExpenseScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AccountsScreen from '../screens/AccountsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileSettings from '../screens/ProfileSettings';
import PaymentSettings from '../screens/PaymentSettings';
import CategoriesSettings from '../screens/CategoriesSettings';
import IncomeSource from '../screens/IncomeSource';
import BackUpSettings from '../screens/BackUpSettings';
import SecuritySettings from '../screens/SecuritySettings';
import CategoriesScreen from '../screens/CategoriesScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import PaymentMethods from '../screens/PaymentMethods';
import { useTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainAppNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 15 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 70 : 55,
          safeAreaInsets: { bottom: 0 }
        },
        tabBarActiveTintColor: '#D26A68',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarLabelStyle: {
          paddingBottom: Platform.OS === 'ios' ? 2 : 0
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
        <Stack.Screen name="BackUpSettings" component={BackUpSettings} />
        <Stack.Screen name="Categories" component={CategoriesSettings} />
        <Stack.Screen name="CategoriesSettings" component={CategoriesScreen} />
        <Stack.Screen name="IncomeSource" component={IncomeSource} />
        <Stack.Screen name="PaymentSettings" component={PaymentSettings} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="MainApp" component={MainAppNavigator} options={{ gestureEnabled: false }} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
