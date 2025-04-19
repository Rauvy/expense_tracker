import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated, Modal, TextInput, SafeAreaView, Platform, FlatList, PanResponder, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/apiService';
import { PieChart } from 'react-native-chart-kit';
import { getPieChartData } from '../services/transactionsService';
import { getTransactions } from '../services/transactionsService';

const { width } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Constants for the chart size
const CHART_RADIUS = Math.min(width - 100, 240) / 2;
const INNER_RADIUS = CHART_RADIUS * 0.55;

// Mock data
const monthlyEarned = 2850;
const monthlySpent = 950;

// Initial categories
const initialCategories = [
  { name: 'Food', icon: 'fast-food', color: '#FF6B6B' },  // Более приглушенный красный
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },   // Приглушенный голубой
  { name: 'Shopping', icon: 'cart', color: '#45B7D1' },   // Приглушенный синий
  { name: 'Bills', icon: 'flash', color: '#96CEB4' },     // Приглушенный зеленый
  { name: 'Entertainment', icon: 'film', color: '#D4A5A5' }, // Приглушенный розовый
];

// Income categories
const initialIncomeCategories = [
  { name: 'Salary', icon: 'cash', color: '#4BC0C0' },
  { name: 'Freelance', icon: 'laptop', color: '#36A2EB' },
  { name: 'Investments', icon: 'trending-up', color: '#FFCE56' },
  { name: 'Gifts', icon: 'gift', color: '#9966FF' },
  { name: 'Other', icon: 'add-circle', color: '#FF9F40' },
];

// Income sources
const initialIncomeSources = [
  { name: 'Employer', icon: 'business', color: '#4BC0C0' },
  { name: 'Client', icon: 'person', color: '#36A2EB' },
  { name: 'Investments', icon: 'stats-chart', color: '#FFCE56' },
];

// Available icons for custom categories
const availableIcons = [
  'basketball', 'airplane', 'book', 'briefcase', 'calculator',
  'calendar', 'camera', 'color-palette', 'desktop', 'fitness',
  'gift', 'glasses', 'home', 'medical', 'paw', 'school'
];

// Predefined colors
const colors = [
  '#FF6B6B',   // Приглушенный красный
  '#4ECDC4',   // Приглушенный голубой
  '#45B7D1',   // Приглушенный синий
  '#96CEB4',   // Приглушенный зеленый
  '#D4A5A5',   // Приглушенный розовый
  '#FFB6B9',   // Приглушенный коралловый
  '#957DAD',   // Приглушенный фиолетовый
  '#E7B7C8'    // Приглушенный розово-лиловый
];

// Default categories
const defaultCategories = [
  { name: 'Food', icon: 'fast-food', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Shopping', icon: 'cart', color: '#45B7D1' },
  { name: 'Bills', icon: 'receipt', color: '#96CEB4' },
  { name: 'Entertainment', icon: 'film', color: '#D4A5A5' },
  { name: 'Health', icon: 'medical', color: '#FFB6B9' },
  { name: 'Education', icon: 'school', color: '#957DAD' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#E7B7C8' },
];

// Default income categories
const defaultIncomeCategories = [
  { name: 'Salary', icon: 'cash', color: '#96CEB4' },       // Приглушенный зеленый
  { name: 'Freelance', icon: 'laptop', color: '#4ECDC4' },  // Приглушенный голубой
  { name: 'Investments', icon: 'trending-up', color: '#45B7D1' }, // Приглушенный синий
  { name: 'Gifts', icon: 'gift', color: '#D4A5A5' },        // Приглушенный розовый
];

// Function to generate pie chart slices
const generatePieChartPath = (index, data, radius, innerRadius) => {
  // Calculate total
  const total = data.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  // Return empty path if total is zero or data is invalid
  if (!total || !data || !data[index]) return '';

  // Calculate start and end angles
  let startAngle = 0;
  for (let i = 0; i < index; i++) {
    const amount = Number(data[i].amount) || 0;
    startAngle += (amount / total) * 2 * Math.PI;
  }

  const amount = Number(data[index].amount) || 0;
  const angle = (amount / total) * 2 * Math.PI;
  const endAngle = startAngle + angle;

  // Calculate coordinates
  const centerX = radius;
  const centerY = radius;

  // Convert angles to coordinates
  const startOuterX = centerX + Math.cos(startAngle) * radius;
  const startOuterY = centerY + Math.sin(startAngle) * radius;
  const endOuterX = centerX + Math.cos(endAngle) * radius;
  const endOuterY = centerY + Math.sin(endAngle) * radius;
  const startInnerX = centerX + Math.cos(startAngle) * innerRadius;
  const startInnerY = centerY + Math.sin(startAngle) * innerRadius;
  const endInnerX = centerX + Math.cos(endAngle) * innerRadius;
  const endInnerY = centerY + Math.sin(endAngle) * innerRadius;

  // Large arc flag
  const largeArcFlag = angle > Math.PI ? 1 : 0;

  // Generate SVG path
  return [
    `M ${startOuterX.toFixed(2)} ${startOuterY.toFixed(2)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endOuterX.toFixed(2)} ${endOuterY.toFixed(2)}`,
    `L ${endInnerX.toFixed(2)} ${endInnerY.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX.toFixed(2)} ${startInnerY.toFixed(2)}`,
    'Z'
  ].join(' ');
};

const recentExpenses = [
  {
    id: 1,
    title: 'Grocery Shopping',
    category: 'Food',
    amount: 85.25,
    date: '15 Jun',
    icon: 'fast-food',
    color: '#FF6384',
  },
  {
    id: 2,
    title: 'Uber Ride',
    category: 'Transport',
    amount: 24.50,
    date: '14 Jun',
    icon: 'car',
    color: '#36A2EB',
  },
  {
    id: 3,
    title: 'New Headphones',
    category: 'Shopping',
    amount: 159.99,
    date: '12 Jun',
    icon: 'cart',
    color: '#FFCE56',
  },
];

const HomeScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [pieChartData, setPieChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlyEarned, setMonthlyEarned] = useState(0);

  // State for modals
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);

  // State for expense form
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // State for income form
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState(null);
  const [selectedIncomeSource, setSelectedIncomeSource] = useState(null);

  // State for custom category/payment method modals
  const [customCategoryModalVisible, setCustomCategoryModalVisible] = useState(false);
  const [customPaymentMethodModalVisible, setCustomPaymentMethodModalVisible] = useState(false);
  const [customIncomeCategoryModalVisible, setCustomIncomeCategoryModalVisible] = useState(false);
  const [customIncomeSourceModalVisible, setCustomIncomeSourceModalVisible] = useState(false);

  // State for custom category/payment method forms
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customPaymentMethodName, setCustomPaymentMethodName] = useState('');
  const [customIncomeCategoryName, setCustomIncomeCategoryName] = useState('');
  const [customIncomeSourceName, setCustomIncomeSourceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedPaymentIcon, setSelectedPaymentIcon] = useState(null);
  const [selectedIncomeIcon, setSelectedIncomeIcon] = useState(null);
  const [selectedSourceIcon, setSelectedSourceIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#D26A68');
  const [selectedPaymentColor, setSelectedPaymentColor] = useState('#D26A68');
  const [selectedIncomeColor, setSelectedIncomeColor] = useState('#D26A68');
  const [selectedSourceColor, setSelectedSourceColor] = useState('#D26A68');

  // State for categories and payment methods
  const [categories, setCategories] = useState([
    { name: 'Food', icon: 'fast-food', color: '#FF9500' },
    { name: 'Transport', icon: 'car', color: '#5856D6' },
    { name: 'Shopping', icon: 'cart', color: '#FF2D55' },
    { name: 'Bills', icon: 'receipt', color: '#4BC0C0' },
    { name: 'Entertainment', icon: 'film', color: '#FF3B30' },
    { name: 'Health', icon: 'medical', color: '#34C759' },
    { name: 'Education', icon: 'school', color: '#007AFF' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([
    { name: 'Salary', icon: 'cash', color: '#4CD964' },
    { name: 'Freelance', icon: 'laptop', color: '#007AFF' },
    { name: 'Investments', icon: 'trending-up', color: '#FFCC00' },
    { name: 'Gifts', icon: 'gift', color: '#FF2D55' },
  ]);
  const [incomeSources, setIncomeSources] = useState([]);

  // Calculate percentages and prepare data
  const formattedPieChartData = useMemo(() => {
    if (!pieChartData || pieChartData.length === 0) return [];

    const total = pieChartData.reduce((acc, item) => acc + item.amount, 0);

    return pieChartData.map((item) => ({
      ...item,
      percentage: Math.round((item.amount / total) * 100),
    }));
  }, [pieChartData]);

  // Add feedback state for buttons
  const [earnedTilePressed, setEarnedTilePressed] = useState(false);
  const [spentTilePressed, setSpentTilePressed] = useState(false);

  // State for statistics modals
  const [incomeStatsModalVisible, setIncomeStatsModalVisible] = useState(false);
  const [expenseStatsModalVisible, setExpenseStatsModalVisible] = useState(false);

  // State for transaction details modal
  const [transactionDetailsVisible, setTransactionDetailsVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // State for statistics screen
  const [activeStatsTab, setActiveStatsTab] = useState('expense');

  // Add state for financial overview
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [financialCards, setFinancialCards] = useState([
    { title: 'Net Worth', value: 0, trend: '0%', color: '#D26A68' },
    { title: 'Assets', value: 0, trend: '0%', color: '#4BC0C0' },
    { title: 'Liabilities', value: 0, trend: '0%', color: '#FF6384' }
  ]);

  const formatAmount = (value) => {
    return Number(value).toFixed(2);
  };

  // Set up refs for the carousel
  const carouselRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Update active index based on scroll position
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / (screenWidth - 30));
      if (index !== activeCardIndex && index >= 0 && index < financialCards.length) {
        setActiveCardIndex(index);
      }
    });

    return () => {
      scrollX.removeListener(listener);
    };
  }, [scrollX, activeCardIndex, financialCards.length]);

  const calculateFinancialOverview = async () => {
    try {
      const response = await getTransactions({ limit: 1000 });
      const transactions = response.items || [];
  
      const assetsTotal = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
      const liabilitiesTotal = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
      const netWorth = assetsTotal - liabilitiesTotal;
  
      setFinancialCards([
        { title: 'Net Worth', value: netWorth, trend: '', color: '#D26A68' },
        { title: 'Assets', value: assetsTotal, trend: '', color: '#4BC0C0' },
        { title: 'Liabilities', value: liabilitiesTotal, trend: '', color: '#FF6384' }
      ]);
    } catch (err) {
      console.error('Error calculating financial overview:', err);
    }
  };

  useEffect(() => {
    calculateFinancialOverview();
  }, []);

  // Function to render financial card item
  const renderFinancialCard = ({ item, index }) => (
    <View style={[styles.tile, { width: screenWidth - 30 }]}>
      <View style={styles.financialCardHeader}>
        <Text style={[styles.tileLabel, { textAlign: 'center', flex: 1 }]}>{item.title}</Text>
        <Ionicons
          name={
            index === 0 ? "wallet-outline" :
            index === 1 ? "trending-up-outline" : "trending-down-outline"
          }
          size={22}
          color={item.color}
        />
      </View>

      <Text style={[styles.tileAmount, { color: item.color, textAlign: 'center' }]}>
        ${item.value.toLocaleString()}
      </Text>
      <Text style={[styles.tileTrend, { textAlign: 'center' }]}>
        {item.trend} this month
      </Text>

      {/* Add Action Buttons - only on Net Worth tile */}
      {index === 0 && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.netWorthActionButton}
            activeOpacity={0.7}
            onPress={() => setIncomeModalVisible(true)}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.netWorthActionText}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.netWorthActionButton, {backgroundColor: '#FF6384'}]}
            activeOpacity={0.7}
            onPress={() => setExpenseModalVisible(true)}
          >
            <Ionicons name="remove-circle" size={20} color="#FFFFFF" />
            <Text style={styles.netWorthActionText}>Expense</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Handle slice press with animation
  const handleSlicePress = (index) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change the content
      setActiveIndex(activeIndex === index ? null : index);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  // Use the constants for the chart
  const chartRadius = CHART_RADIUS;
  const innerRadius = INNER_RADIUS;
  const centerX = chartRadius;
  const centerY = chartRadius;

  // Handle add expense
  const handleAddExpense = async () => {
    if (!expenseAmount || !selectedCategory || !selectedPaymentMethod) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('access_token');
      await api.post('/transactions/', {
        type: 'expense',
        amount: parseFloat(expenseAmount),
        category: selectedCategory,
        payment_method: selectedPaymentMethod,
        description: expenseDescription,
        date: new Date().toISOString(),
        source: 'manual',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Expense added!');
      setExpenseAmount('');
      setExpenseDescription('');
      setSelectedCategory(null);
      setSelectedPaymentMethod(null);
      setExpenseModalVisible(false);

      await fetchPieChartData();
      await calculateMonthlyTotals();
      await fetchRecentTransactions();
      await calculateFinancialOverview();
    } catch (err) {
      Alert.alert('Error', 'Failed to add expense.');
    }
  };

  // Handle add income
  const handleAddIncome = async () => {
    if (!incomeAmount || !selectedIncomeCategory || !selectedIncomeSource) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('access_token');
      await api.post('/transactions/', {
        type: 'income',
        amount: parseFloat(incomeAmount),
        category: selectedIncomeCategory,
        payment_method: selectedIncomeSource,
        description: incomeDescription,
        date: new Date().toISOString(),
        source: 'manual',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Income added!');
      setIncomeAmount('');
      setIncomeDescription('');
      setSelectedIncomeCategory(null);
      setSelectedIncomeSource(null);
      setIncomeModalVisible(false);

      await fetchPieChartData();
      await calculateMonthlyTotals();
      await fetchRecentTransactions();
      await calculateFinancialOverview();
    } catch (err) {
      Alert.alert('Error', 'Failed to add income.');
    }
  };

  // Handle transaction click
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsVisible(true);
  };

  // Handle statistics tab change
  const handleStatsTabChange = (tab) => {
    setActiveStatsTab(tab);
  };

  // Add effect to load categories from AsyncStorage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedExpenseCategories = await AsyncStorage.getItem('expenseCategories');
        const storedIncomeCategories = await AsyncStorage.getItem('incomeCategories');

        if (storedExpenseCategories) {
          setCategories(JSON.parse(storedExpenseCategories));
        } else {
          // Set default categories if none found
          const defaultCategories = [
            { name: 'Food', icon: 'fast-food', color: '#FF6B6B' },
            { name: 'Transport', icon: 'car', color: '#4ECDC4' },
            { name: 'Shopping', icon: 'cart', color: '#45B7D1' },
            { name: 'Bills', icon: 'receipt', color: '#96CEB4' },
            { name: 'Entertainment', icon: 'film', color: '#D4A5A5' },
            { name: 'Health', icon: 'medical', color: '#FFB6B9' },
            { name: 'Education', icon: 'school', color: '#957DAD' },
            { name: 'Other', icon: 'ellipsis-horizontal', color: '#E7B7C8' },
          ];
          setCategories(defaultCategories);
          await AsyncStorage.setItem('expenseCategories', JSON.stringify(defaultCategories));
        }

        if (storedIncomeCategories) {
          setIncomeCategories(JSON.parse(storedIncomeCategories));
        } else {
          // Set default income categories if none found
          const defaultIncomeCategories = [
            { name: 'Salary', icon: 'cash', color: '#96CEB4' },
            { name: 'Freelance', icon: 'laptop', color: '#4ECDC4' },
            { name: 'Investments', icon: 'trending-up', color: '#45B7D1' },
            { name: 'Gifts', icon: 'gift', color: '#D4A5A5' },
          ];
          setIncomeCategories(defaultIncomeCategories);
          await AsyncStorage.setItem('incomeCategories', JSON.stringify(defaultIncomeCategories));
        }
      } catch (error) {
        console.log('Error loading categories from storage:', error);
      }
    };

    loadCategories();

    // Add a focus listener to reload categories when screen comes into focus
    const unsubscribe = navigation.addListener('focus', loadCategories);

    return unsubscribe;
  }, [navigation]);

  // Modify the Custom Category Modal to save to AsyncStorage
  const saveCategory = useCallback(async (newCategory) => {
    try {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
      setSelectedCategory(newCategory.name);
      setCustomCategoryModalVisible(false);

      // Reset form
      setCustomCategoryName('');
      setSelectedIcon(null);
    } catch (error) {
      console.log('Error saving expense category:', error);
    }
  }, [categories]);

  // Modify the Custom Income Category Modal to save to AsyncStorage
  const saveIncomeCategory = useCallback(async (newCategory) => {
    try {
      const updatedCategories = [...incomeCategories, newCategory];
      setIncomeCategories(updatedCategories);
      await AsyncStorage.setItem('incomeCategories', JSON.stringify(updatedCategories));
      setSelectedIncomeCategory(newCategory.name);
      setCustomIncomeCategoryModalVisible(false);

      // Reset form
      setCustomIncomeCategoryName('');
      setSelectedIncomeIcon(null);
    } catch (error) {
      console.log('Error saving income category:', error);
    }
  }, [incomeCategories]);

  const renderSwipeableSection = () => (
    <View style={styles.swipeableSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.swipeableContent}
      >
        <View style={styles.swipeableTile}>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle}>Total Balance</Text>
            <Text style={styles.tileAmount}>$12,345.67</Text>
            <Text style={styles.tileSubtitle}>+$1,234.56 this month</Text>
          </View>
        </View>

        <View style={styles.swipeableTile}>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle}>Monthly Budget</Text>
            <Text style={styles.tileAmount}>$5,000.00</Text>
            <Text style={styles.tileSubtitle}>$3,456.78 spent</Text>
          </View>
        </View>

        <View style={styles.swipeableTile}>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle}>Assets</Text>
            <View style={styles.categoryList}>
              <View style={styles.categoryItem}>
                <Ionicons name="cash" size={16} color="#4BC0C0" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Cash & Bank Accounts</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="trending-up" size={16} color="#4BC0C0" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Investments</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="home" size={16} color="#4BC0C0" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Real Estate</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="car" size={16} color="#4BC0C0" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Vehicles</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="cube" size={16} color="#4BC0C0" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Other Assets</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.swipeableTile}>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle}>Liabilities</Text>
            <View style={styles.categoryList}>
              <View style={styles.categoryItem}>
                <Ionicons name="card" size={16} color="#FF6384" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Credit Cards</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="cash" size={16} color="#FF6384" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Loans</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="home" size={16} color="#FF6384" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Mortgages</Text>
              </View>
              <View style={styles.categoryItem}>
                <Ionicons name="document" size={16} color="#FF6384" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>Other Debts</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Load recent transactions
  const fetchRecentTransactions = async () => {
    try {
      const data = await getTransactions({
        limit: 3,
        offset: 0
      });

      const transactionsWithStyle = (data.items || []).map((tx) => {
        const categoryList = tx.type === 'income' ? incomeCategories : categories;
        const categoryInfo = categoryList.find((cat) => cat.name === tx.category) || {
          icon: 'ellipsis-horizontal',
          color: colors[0]
        };

        return {
          ...tx,
          amount: Number(tx.amount) || 0,
          icon: categoryInfo.icon,
          color: categoryInfo.color,
        };
      });
      setRecentTransactions(transactionsWithStyle);
    } catch (err) {
      console.log('❌ Failed to load recent transactions:', err);
    }
  };

  // Initial load and refresh on focus
  useEffect(() => {
    fetchRecentTransactions();

    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Refreshing recent transactions...');
      fetchRecentTransactions();
    });

    return unsubscribe;
  }, [navigation]);
  const fetchPieChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPieChartData('expense');

      if (!response || !response.data) {
        console.log('Invalid response structure:', response);
        setError('Invalid data structure received');
        return;
      }

      const serverData = response.data || [];
      console.log('Processing pie chart data:', serverData);

      if (!Array.isArray(serverData) || serverData.length === 0) {
        console.log('No valid data in response');
        setPieChartData([]);
        return;
      }

      const formattedData = serverData.map((item, index) => ({
        name: item.category || 'Unknown',
        amount: Number(item.amount) || 0,
        color: colors[index % colors.length],
        legendFontColor: '#FFFFFF',
        legendFontSize: 12,
      })).filter(item => item.amount > 0); // Фильтруем только положительные значения

      console.log('Formatted pie chart data:', formattedData);
      setPieChartData(formattedData);
    } catch (error) {
      console.error('Error in fetchPieChartData:', error);
      setError('Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPieChartData();
  }, []);

  const calculateMonthlyTotals = useCallback(async () => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      console.log('Fetching transactions...');
      // Get all transactions for the current month
      const response = await getTransactions({
        limit: 1000, // Get a large number to ensure we have all transactions
      });

      console.log('Received response:', response);

      // Check if we have transactions in the response
      if (!response || !response.items) {
        console.log('No transactions found in response:', response);
        return;
      }

      // Filter transactions for current month and calculate totals
      const monthlyTransactions = response.items.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= firstDayOfMonth;
      });

      console.log('Monthly transactions:', monthlyTransactions);

      const spent = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const earned = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      console.log('Calculated totals - Spent:', spent, 'Earned:', earned);

      setMonthlySpent(spent);
      setMonthlyEarned(earned);
    } catch (error) {
      console.error('Error calculating monthly totals:', error);
    }
  }, []);

  // Add useEffect to call calculateMonthlyTotals on mount and when transactions change
  useEffect(() => {
    calculateMonthlyTotals();
  }, [calculateMonthlyTotals]);

  // Add a refresh function that can be called when new transactions are added
  const refreshMonthlyTotals = useCallback(() => {
    calculateMonthlyTotals();
  }, [calculateMonthlyTotals]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const savedMethods = await AsyncStorage.getItem('paymentMethods');
        
        if (savedMethods) {
          setPaymentMethods(JSON.parse(savedMethods));
        } else {
          const defaultPaymentMethods = [
            { id: '1', name: 'Credit Card', icon: 'card', color: '#FF6384' },
            { id: '2', name: 'Cash', icon: 'cash', color: '#4BC0C0' },
            { id: '3', name: 'Mobile Pay', icon: 'phone-portrait', color: '#9966FF' },
          ];
          setPaymentMethods(defaultPaymentMethods);
          await AsyncStorage.setItem('paymentMethods', JSON.stringify(defaultPaymentMethods));
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };
    
    loadPaymentMethods();
    
    const unsubscribe = navigation.addListener('focus', loadPaymentMethods);
    
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {
    const loadIncomeSources = async () => {
      try {
        const savedSources = await AsyncStorage.getItem('incomeSources');
        
        if (savedSources) {
          setIncomeSources(JSON.parse(savedSources));
        } else {
          const defaultIncomeSources = [
            { id: '1', name: 'Bank Account', icon: 'card', color: '#4BC0C0' },
            { id: '2', name: 'Cash', icon: 'cash', color: '#FF6384' },
            { id: '3', name: 'Mobile Wallet', icon: 'phone-portrait', color: '#9966FF' },
          ];
          setIncomeSources(defaultIncomeSources);
          await AsyncStorage.setItem('incomeSources', JSON.stringify(defaultIncomeSources));
        }
      } catch (error) {
        console.error('Error loading income sources:', error);
      }
    };
    
    loadIncomeSources();
    
    const unsubscribe = navigation.addListener('focus', loadIncomeSources);
    
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.screenPadding}>
          {/* Financial Cards Carousel */}
          <View style={styles.monthlyStatsHeader}>
            <Text style={styles.sectionTitle}>Financial Overview</Text>
          </View>

          <View style={styles.carouselWrapper}>
            <AnimatedFlatList
              ref={carouselRef}
              data={financialCards}
              renderItem={renderFinancialCard}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth - 30}
              decelerationRate="fast"
              snapToAlignment="center"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              contentContainerStyle={styles.carouselContentContainer}
            />
          </View>

          {/* Pagination Indicators */}
          <View style={styles.paginationDots}>
            {financialCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeCardIndex === index ? styles.paginationDotActive : {}
                ]}
              />
            ))}
          </View>

          {/* Monthly Stats Section */}
          <View style={styles.monthlyStatsHeader}>
            <Text style={styles.sectionTitle}>Monthly Statistics</Text>
            <Ionicons name="stats-chart" size={22} color="#D26A68" />
          </View>

          {/* Tiles for Monthly Earned and Monthly Spent */}
          <View style={styles.tilesContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.tile, earnedTilePressed && styles.tileTouched]}
              onPress={() => {
                setEarnedTilePressed(true);
                setTimeout(() => setEarnedTilePressed(false), 150);
                setIncomeStatsModalVisible(true);
              }}
            >
              <Text style={styles.tileLabel}>Monthly Earned</Text>
              <Text style={[styles.tileAmount, styles.earnedAmount]}>${monthlyEarned.toFixed(2)}</Text>
              <View style={styles.tileIconContainer}>
                <Ionicons name="trending-up" size={24} color="#4BC0C0" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.tile, spentTilePressed && styles.tileTouched]}
              onPress={() => {
                setSpentTilePressed(true);
                setTimeout(() => setSpentTilePressed(false), 150);
                setExpenseStatsModalVisible(true);
              }}
            >
              <Text style={styles.tileLabel}>Monthly Spent</Text>
              <Text style={[styles.tileAmount, styles.spentAmount]}>${monthlySpent.toFixed(2)}</Text>
              <View style={styles.tileIconContainer}>
                <Ionicons name="trending-down" size={24} color="#FF6384" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Activity Section with Pie Chart */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <Text style={styles.sectionSubtitle}>Spending by Category</Text>

            <View style={styles.chartAndLegendWrapper}>
              {/* Left side: Pie Chart */}
              <View style={styles.chartContainer}>
                {isLoading ? (
                  <Text style={styles.noDataText}>Loading...</Text>
                ) : error ? (
                  <Text style={styles.noDataText}>{error}</Text>
                ) : pieChartData.length > 0 ? (
                  <>
                    <View style={styles.totalSpentBox}>
                      <Text style={styles.totalSpentAmount}>
                        ${pieChartData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                      </Text>
                      <Text style={styles.totalSpentLabel}>Total Spent</Text>
                    </View>
                    <View style={styles.chartWrapper}>
                      <PieChart
                        data={pieChartData.map((item, index) => ({
                          ...item,
                          color: activeIndex === index ? item.color : `${item.color}99`,
                        }))}
                        width={Dimensions.get('window').width}
                        height={420}
                        chartConfig={{
                          backgroundColor: '#1a1a1a',
                          backgroundGradientFrom: '#1a1a1a',
                          backgroundGradientTo: '#1a1a1a',
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#ffa726',
                          },
                        }}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        center={[Dimensions.get('window').width / 4, 0]}
                        absolute
                        hasLegend={false}
                      />
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataText}>No data available</Text>
                )}
              </View>

              {/* Categories below the chart */}
              <View style={styles.legendContainer}>
                <View style={styles.legendGrid}>
                  {formattedPieChartData.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.legendItem,
                        activeIndex === index && styles.activeLegendItem
                      ]}
                      onPress={() => handleSlicePress(index)}
                    >
                      <View style={[styles.legendColorDot, { backgroundColor: category.color }]} />
                      <Text style={styles.legendLabel}>{category.name}</Text>
                      <Text style={styles.legendValue}>
                        {activeIndex === index
                          ? `$${category.amount.toFixed(2)}`
                          : `${category.percentage}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Recent Expenses */}
          <View style={styles.expenseContainer}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.expenseItem}
                  onPress={() => navigation.navigate('Transactions', { selectedTransaction: transaction })}
                >
                  <View style={[styles.expenseIcon, { backgroundColor: transaction.color }]}>
                    <Ionicons name={transaction.icon} size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseTitle}>{transaction.description}</Text>
                    <Text style={styles.expenseCategory}>{transaction.category}</Text>
                  </View>

                  <View style={styles.expenseAmount}>
                    <Text style={[
                      styles.expenseValue,
                      { color: transaction.type === 'income' ? '#4BC0C0' : '#FF6384' }
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noExpensesContainer}>
                <Text style={styles.noExpensesText}>No recent transactions</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={expenseModalVisible}
        onRequestClose={() => {
          setExpenseModalVisible(false);
          setExpenseAmount('');
          setExpenseDescription('');
          setSelectedCategory(null);
          setSelectedPaymentMethod(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Expense</Text>
                <TouchableOpacity
                  onPress={() => {
                    setExpenseModalVisible(false);
                    setExpenseAmount('');
                    setExpenseDescription('');
                    setSelectedCategory(null);
                    setSelectedPaymentMethod(null);
                  }}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Expense Form */}
              <TextInput
                style={styles.amountInput}
                placeholder="$0.00"
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#666666"
                value={expenseDescription}
                onChangeText={setExpenseDescription}
              />

              <Text style={styles.categoryLabel}>Select Category</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.name && { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setExpenseModalVisible(false);
                    setExpenseAmount('');
                    setExpenseDescription('');
                    setSelectedCategory(null);
                    setSelectedPaymentMethod(null);
                    navigation.navigate('Categories');
                  }}
                >
                  <Ionicons name="add" size={20} color="#D26A68" />
                  <Text style={styles.addCategoryText}>Custom</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.categoryLabel}>Payment Method</Text>
              <View style={styles.categoriesContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.name}
                    style={[
                      styles.categoryButton,
                      selectedPaymentMethod === method.name && { borderColor: method.color }
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: method.color }]}>
                      <Ionicons name={method.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryText}>{method.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setExpenseModalVisible(false);
                    setExpenseAmount('');
                    setExpenseDescription('');
                    setSelectedCategory(null);
                    setSelectedPaymentMethod(null);
                    navigation.navigate('PaymentMethods');
                  }}
                >
                  <Ionicons name="add" size={20} color="#D26A68" />
                  <Text style={styles.addCategoryText}>Custom</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: '#FF6384' }]}
                onPress={handleAddExpense}
              >
                <Text style={styles.buttonText}>Add Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Income Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={incomeModalVisible}
        onRequestClose={() => {
          setIncomeModalVisible(false);
          setIncomeAmount('');
          setIncomeDescription('');
          setSelectedIncomeCategory(null);
          setSelectedIncomeSource(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Income</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIncomeModalVisible(false);
                    setIncomeAmount('');
                    setIncomeDescription('');
                    setSelectedIncomeCategory(null);
                    setSelectedIncomeSource(null);
                  }}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Income Form */}
              <TextInput
                style={styles.amountInput}
                placeholder="$0.00"
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                value={incomeAmount}
                onChangeText={setIncomeAmount}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#666666"
                value={incomeDescription}
                onChangeText={setIncomeDescription}
              />

              <Text style={styles.categoryLabel}>Income Category</Text>
              <View style={styles.categoriesContainer}>
                {incomeCategories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryButton,
                      selectedIncomeCategory === category.name && { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedIncomeCategory(category.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setIncomeModalVisible(false);
                    setIncomeAmount('');
                    setIncomeDescription('');
                    setSelectedIncomeCategory(null);
                    setSelectedIncomeSource(null);
                    navigation.navigate('IncomeSource');
                  }}
                >
                  <Ionicons name="add" size={20} color="#D26A68" />
                  <Text style={styles.addCategoryText}>Custom</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.categoryLabel}>Income Source</Text>
              <View style={styles.categoriesContainer}>
                {incomeSources.map((source) => (
                  <TouchableOpacity
                    key={source.name}
                    style={[
                      styles.categoryButton,
                      selectedIncomeSource === source.name && { borderColor: source.color }
                    ]}
                    onPress={() => setSelectedIncomeSource(source.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: source.color }]}>
                      <Ionicons name={source.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryText}>{source.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setIncomeModalVisible(false);
                    setIncomeAmount('');
                    setIncomeDescription('');
                    setSelectedIncomeCategory(null);
                    setSelectedIncomeSource(null);
                    navigation.navigate('IncomeSource');
                  }}
                >
                  <Ionicons name="add" size={20} color="#D26A68" />
                  <Text style={styles.addCategoryText}>Custom</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: '#4BC0C0' }]}
                onPress={handleAddIncome}
              >
                <Text style={styles.buttonText}>Add Income</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Category Modal */}
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={customCategoryModalVisible}
        onRequestClose={() => setCustomCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Category</Text>
                <TouchableOpacity onPress={() => setCustomCategoryModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Category Name"
                placeholderTextColor="#666666"
                value={customCategoryName}
                onChangeText={setCustomCategoryName}
              />

              <Text style={styles.categoryLabel}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {['fast-food', 'car', 'cart', 'receipt', 'film', 'medical', 'school', 'basket', 'home', 'fitness', 'briefcase', 'game-controller', 'gift'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && { borderColor: selectedColor, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons name={icon} size={24} color="#ffffff" />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.categoryLabel}>Select Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && { borderColor: '#ffffff', borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: selectedColor || '#D26A68' }]}
                onPress={() => {
                  if (customCategoryName.trim() && selectedIcon) {
                    saveCategory({
                      name: customCategoryName.trim(),
                      icon: selectedIcon,
                      color: selectedColor || '#D26A68'
                    });
                  }
                }}
              >
                <Text style={styles.buttonText}>Create Category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal> */}

      {/* Custom Payment Method Modal */}
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={customPaymentMethodModalVisible}
        onRequestClose={() => setCustomPaymentMethodModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Payment Method</Text>
                <TouchableOpacity onPress={() => setCustomPaymentMethodModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Payment Method Name"
                placeholderTextColor="#666666"
                value={customPaymentMethodName}
                onChangeText={setCustomPaymentMethodName}
              />

              <Text style={styles.categoryLabel}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {['card', 'cash', 'wallet', 'phone-portrait', 'logo-paypal'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedPaymentIcon === icon && { borderColor: selectedPaymentColor, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedPaymentIcon(icon)}
                  >
                    <Ionicons name={icon} size={24} color="#ffffff" />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.categoryLabel}>Select Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedPaymentColor === color && { borderColor: '#ffffff', borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedPaymentColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: selectedPaymentColor || '#D26A68' }]}
                onPress={() => {
                  if (customPaymentMethodName.trim() && selectedPaymentIcon) {
                    const newPaymentMethod = {
                      name: customPaymentMethodName.trim(),
                      icon: selectedPaymentIcon,
                      color: selectedPaymentColor || '#D26A68'
                    };

                    setPaymentMethods([...paymentMethods, newPaymentMethod]);
                    setSelectedPaymentMethod(newPaymentMethod.name);
                    setCustomPaymentMethodModalVisible(false);

                    // Reset form
                    setCustomPaymentMethodName('');
                    setSelectedPaymentIcon(null);
                  }
                }}
              >
                <Text style={styles.buttonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal> */}

      {/* Custom Income Category Modal */}
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={customIncomeCategoryModalVisible}
        onRequestClose={() => setCustomIncomeCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Income Category</Text>
                <TouchableOpacity onPress={() => setCustomIncomeCategoryModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Category Name"
                placeholderTextColor="#666666"
                value={customIncomeCategoryName}
                onChangeText={setCustomIncomeCategoryName}
              />

              <Text style={styles.categoryLabel}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {['cash', 'card', 'wallet', 'laptop', 'business', 'stats-chart', 'briefcase', 'gift'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIncomeIcon === icon && { borderColor: selectedIncomeColor, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedIncomeIcon(icon)}
                  >
                    <Ionicons name={icon} size={24} color="#ffffff" />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.categoryLabel}>Select Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedIncomeColor === color && { borderColor: '#ffffff', borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedIncomeColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: selectedIncomeColor || '#4BC0C0' }]}
                onPress={() => {
                  if (customIncomeCategoryName.trim() && selectedIncomeIcon) {
                    saveIncomeCategory({
                      name: customIncomeCategoryName.trim(),
                      icon: selectedIncomeIcon,
                      color: selectedIncomeColor || '#4BC0C0'
                    });
                  }
                }}
              >
                <Text style={styles.buttonText}>Create Income Category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal> */}

      {/* Custom Income Source Modal */}
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={customIncomeSourceModalVisible}
        onRequestClose={() => setCustomIncomeSourceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Income Source</Text>
                <TouchableOpacity onPress={() => setCustomIncomeSourceModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Source Name"
                placeholderTextColor="#666666"
                value={customIncomeSourceName}
                onChangeText={setCustomIncomeSourceName}
              />

              <Text style={styles.categoryLabel}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {['business', 'person', 'stats-chart', 'globe', 'people', 'home', 'gift'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedSourceIcon === icon && { borderColor: selectedSourceColor, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedSourceIcon(icon)}
                  >
                    <Ionicons name={icon} size={24} color="#ffffff" />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.categoryLabel}>Select Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedSourceColor === color && { borderColor: '#ffffff', borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedSourceColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: selectedSourceColor || '#4BC0C0' }]}
                onPress={() => {
                  if (customIncomeSourceName.trim() && selectedSourceIcon) {
                    const newSource = {
                      name: customIncomeSourceName.trim(),
                      icon: selectedSourceIcon,
                      color: selectedSourceColor || '#4BC0C0'
                    };

                    setIncomeSources([...incomeSources, newSource]);
                    setSelectedIncomeSource(newSource.name);
                    setCustomIncomeSourceModalVisible(false);

                    // Reset form
                    setCustomIncomeSourceName('');
                    setSelectedSourceIcon(null);
                  }
                }}
              >
                <Text style={styles.buttonText}>Add Source</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal> */}

      {/* Statistics Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={incomeStatsModalVisible || expenseStatsModalVisible}
        onRequestClose={() => {
          if (incomeStatsModalVisible) setIncomeStatsModalVisible(false);
          if (expenseStatsModalVisible) setExpenseStatsModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Financial Analysis</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (incomeStatsModalVisible) setIncomeStatsModalVisible(false);
                    if (expenseStatsModalVisible) setExpenseStatsModalVisible(false);
                  }}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Tab Selector */}
              <View style={styles.statsTabSelector}>
                <TouchableOpacity
                  style={[
                    styles.statsTab,
                    activeStatsTab === 'income' && styles.statsTabActive
                  ]}
                  onPress={() => handleStatsTabChange('income')}
                >
                  <Ionicons
                    name="trending-up"
                    size={18}
                    color={activeStatsTab === 'income' ? '#4BC0C0' : '#999999'}
                  />
                  <Text style={[
                    styles.statsTabText,
                    activeStatsTab === 'income' && styles.statsTabTextActive,
                    activeStatsTab === 'income' && {color: '#4BC0C0'}
                  ]}>Income</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statsTab,
                    activeStatsTab === 'expense' && styles.statsTabActive
                  ]}
                  onPress={() => handleStatsTabChange('expense')}
                >
                  <Ionicons
                    name="trending-down"
                    size={18}
                    color={activeStatsTab === 'expense' ? '#FF6384' : '#999999'}
                  />
                  <Text style={[
                    styles.statsTabText,
                    activeStatsTab === 'expense' && styles.statsTabTextActive,
                    activeStatsTab === 'expense' && {color: '#FF6384'}
                  ]}>Expenses</Text>
                </TouchableOpacity>
              </View>

              {/* Income Statistics Content */}
              {activeStatsTab === 'income' && (
                <>
                  {/* Monthly Income Summary Card */}
                  <View style={styles.statsSummaryCard}>
                    <View style={styles.statsSummaryHeader}>
                      <Text style={styles.statsCardTitle}>Monthly Income</Text>
                    </View>

                    <Text style={[styles.statsAmount, {color: '#4BC0C0'}]}>${monthlyEarned.toFixed(2)}</Text>

                    <View style={styles.statsDivider} />

                    <View style={styles.statsMetricsContainer}>
                      <View style={styles.statsMetricItem}>
                        <View style={styles.statsMetricIcon}>
                          <Ionicons name="arrow-up" size={16} color="#FFFFFF" style={styles.statsMetricIconBg} />
                        </View>
                        <Text style={styles.statsMetricValue}>+12.5%</Text>
                        <Text style={styles.statsMetricLabel}>vs Last Month</Text>
                      </View>

                      <View style={styles.statsMetricItem}>
                        <View style={styles.statsMetricIcon}>
                          <Ionicons name="calendar" size={16} color="#FFFFFF" style={[styles.statsMetricIconBg, {backgroundColor: '#9966FF'}]} />
                        </View>
                        <Text style={styles.statsMetricValue}>${(monthlyEarned / 30).toFixed(2)}</Text>
                        <Text style={styles.statsMetricLabel}>Daily Average</Text>
                      </View>

                      <View style={styles.statsMetricItem}>
                        <View style={styles.statsMetricIcon}>
                          <Ionicons name="trending-up" size={16} color="#FFFFFF" style={[styles.statsMetricIconBg, {backgroundColor: '#36A2EB'}]} />
                        </View>
                        <Text style={styles.statsMetricValue}>$34,200</Text>
                        <Text style={styles.statsMetricLabel}>Yearly Pace</Text>
                      </View>
                    </View>
                  </View>

                  {/* Income Trend Chart */}
                  <View style={styles.statsTrendCard}>
                    <Text style={styles.statsSectionTitle}>Monthly Trend</Text>
                    <View style={styles.trendChartContainer}>
                      {/* Simplified trend bars */}
                      {[0.7, 0.8, 0.75, 0.9, 0.85, 1].map((height, index) => (
                        <View key={index} style={styles.trendBarWrapper}>
                          <View style={[styles.trendBar, { height: 100 * height, backgroundColor: '#4BC0C0' }]} />
                          <Text style={styles.trendBarLabel}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Income by Category */}
                  <View style={styles.statsDetailCard}>
                    <Text style={styles.statsSectionTitle}>Income by Category</Text>
                    <View style={styles.statsBarContainer}>
                      {incomeCategories.slice(0, 4).map((category, index) => (
                        <View key={index} style={styles.statsBarItemEnhanced}>
                          <View style={styles.statsBarHeader}>
                            <View style={styles.statsBarLabelContainer}>
                              <View style={[styles.categoryDot, {backgroundColor: category.color}]} />
                              <Text style={styles.statsBarLabel}>{category.name}</Text>
                            </View>
                            <View style={styles.statsBarValueContainer}>
                              <Text style={styles.statsBarValue}>${(monthlyEarned * (0.3 - index * 0.05)).toFixed(2)}</Text>
                              <Text style={styles.statsBarPercentage}>{Math.round(30 - index * 5)}%</Text>
                            </View>
                          </View>
                          <View style={styles.statsBarBackground}>
                            <View style={[styles.statsBar, {
                              backgroundColor: category.color,
                              width: `${Math.max(5, 90 - index * 20)}%`
                            }]} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Income Sources */}
                  <View style={styles.statsDetailCard}>
                    <Text style={styles.statsSectionTitle}>Income Sources</Text>
                    <View style={styles.statsSourceList}>
                      {incomeSources.map((source, index) => (
                        <View key={index} style={styles.statsSourceItem}>
                          <View style={[styles.statsSourceIcon, {backgroundColor: source.color}]}>
                            <Ionicons name={source.icon} size={20} color="#FFFFFF" />
                          </View>
                          <View style={styles.statsSourceInfo}>
                            <Text style={styles.statsSourceName}>{source.name}</Text>
                            <Text style={styles.statsSourceCount}>{index + 2} transactions</Text>
                          </View>
                          <Text style={styles.statsSourceAmount}>${(monthlyEarned * (0.4 - index * 0.15)).toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* Expense Statistics Content */}
              {activeStatsTab === 'expense' && (
                <>
                  {/* Monthly Expense Summary */}
                  <View style={styles.statsSummaryCard}>
                    <View style={styles.statsSummaryHeader}>
                      <Text style={styles.statsCardTitle}>Monthly Expenses</Text>
                    </View>

                    <Text style={[styles.statsAmount, {color: '#FF6384'}]}>${monthlySpent.toFixed(2)}</Text>

                    <View style={styles.statsDivider} />

                    <View style={styles.statsMetricsContainer}>
                      <View style={styles.statsMetricItem}>
                        <View style={styles.statsMetricIcon}>
                          <Ionicons name="arrow-down" size={16} color="#FFFFFF" style={styles.statsMetricIconBg} />
                        </View>
                        <Text style={styles.statsMetricValue}>-8.3%</Text>
                        <Text style={styles.statsMetricLabel}>vs Last Month</Text>
                      </View>

                      <View style={styles.statsMetricItem}>
                        <View style={styles.statsMetricIcon}>
                          <Ionicons name="calendar" size={16} color="#FFFFFF" style={[styles.statsMetricIconBg, {backgroundColor: '#9966FF'}]} />
                        </View>
                        <Text style={styles.statsMetricValue}>${(monthlySpent / 30).toFixed(2)}</Text>
                        <Text style={styles.statsMetricLabel}>Daily Average</Text>
                      </View>

                      <View style={styles.statsMetricItem}>
                        <View style={styles.statsMetricIcon}>
                          <Ionicons name="wallet" size={16} color="#FFFFFF" style={[styles.statsMetricIconBg, {backgroundColor: '#FF9F40'}]} />
                        </View>
                        <Text style={styles.statsMetricValue}>${(monthlyEarned - monthlySpent).toFixed(2)}</Text>
                        <Text style={styles.statsMetricLabel}>Net Income</Text>
                      </View>
                    </View>
                  </View>

                  {/* Budget Progress */}
                  <View style={styles.statsBudgetCard}>
                    <Text style={styles.statsSectionTitle}>Budget Progress</Text>
                    <View style={styles.budgetProgressContainer}>
                      {/* Budget progress circles */}
                      <View style={styles.budgetProgressItem}>
                        <View style={styles.budgetCircleContainer}>
                          <View style={styles.budgetCircleBackground}></View>
                          <View style={[styles.budgetCircleProgress, {
                            borderColor: '#FF6384',
                            transform: [{ rotateZ: `${0.71 * Math.PI}rad` }],
                          }]}></View>
                          <View style={styles.budgetCircleContent}>
                            <Text style={styles.budgetCirclePercentage}>71%</Text>
                            <Text style={styles.budgetCircleLabel}>of budget</Text>
                          </View>
                        </View>
                        <Text style={styles.budgetProgressLabel}>Total Spending</Text>
                      </View>

                      <View style={styles.budgetProgressItem}>
                        <View style={styles.budgetCircleContainer}>
                          <View style={styles.budgetCircleBackground}></View>
                          <View style={[styles.budgetCircleProgress, {
                            borderColor: '#4BC0C0',
                            transform: [{ rotateZ: `${0.35 * Math.PI}rad` }],
                          }]}></View>
                          <View style={styles.budgetCircleContent}>
                            <Text style={styles.budgetCirclePercentage}>35%</Text>
                            <Text style={styles.budgetCircleLabel}>of month</Text>
                          </View>
                        </View>
                        <Text style={styles.budgetProgressLabel}>Time Elapsed</Text>
                      </View>
                    </View>
                  </View>

                  {/* Expense Pie Chart */}
                  <View style={styles.statsDetailCard}>
                    <Text style={styles.statsSectionTitle}>Expenses by Category</Text>
                    <View style={styles.statsPieContainer}>
                      <View style={styles.chartContainer}>
                        <Svg width={chartRadius * 2} height={chartRadius * 2}>
                          <G>
                            {formattedPieChartData.map((item, index) => (
                              <Path
                                key={index}
                                d={generatePieChartPath(index, formattedPieChartData, chartRadius, innerRadius)}
                                fill={item.color}
                                stroke="#1a1a1a"
                                strokeWidth={1}
                              />
                            ))}
                            <Circle
                              cx={centerX}
                              cy={centerY}
                              r={innerRadius}
                              fill="#1a1a1a"
                              stroke="#333333"
                              strokeWidth={2}
                            />
                          </G>
                        </Svg>
                      </View>
                    </View>

                    {/* Category List */}
                    <View style={styles.statsBarContainer}>
                      {formattedPieChartData.map((category, index) => (
                        <View key={index} style={styles.statsBarItemEnhanced}>
                          <View style={styles.statsBarHeader}>
                            <View style={styles.statsBarLabelContainer}>
                              <View style={[styles.categoryDot, {backgroundColor: category.color}]} />
                              <Text style={styles.statsBarLabel}>{category.name}</Text>
                            </View>
                            <View style={styles.statsBarValueContainer}>
                              <Text style={styles.statsBarValue}>${category.amount.toFixed(2)}</Text>
                              <Text style={styles.statsBarPercentage}>{category.percentage}%</Text>
                            </View>
                          </View>
                          <View style={styles.statsBarBackground}>
                            <View style={[styles.statsBar, {
                              backgroundColor: category.color,
                              width: `${Math.max(5, category.percentage)}%`
                            }]} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Payment Methods */}
                  <View style={styles.statsDetailCard}>
                    <Text style={styles.statsSectionTitle}>Payment Methods</Text>
                    <View style={styles.statsSourceList}>
                      {paymentMethods.map((method, index) => (
                        <View key={index} style={styles.statsSourceItem}>
                          <View style={[styles.statsSourceIcon, {backgroundColor: method.color}]}>
                            <Ionicons name={method.icon} size={20} color="#FFFFFF" />
                          </View>
                          <View style={styles.statsSourceInfo}>
                            <Text style={styles.statsSourceName}>{method.name}</Text>
                            <Text style={styles.statsSourceCount}>{3 - index} transactions</Text>
                          </View>
                          <Text style={styles.statsSourceAmount}>${(monthlySpent * (0.5 - index * 0.15)).toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={transactionDetailsVisible}
        onRequestClose={() => setTransactionDetailsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setTransactionDetailsVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <View style={styles.transactionDetailsContent}>
                <View style={[styles.transactionIcon, { backgroundColor: selectedTransaction.color }]}>
                  <Ionicons name={selectedTransaction.icon} size={24} color="#FFFFFF" />
                </View>

                <Text style={styles.transactionDetailsTitle}>{selectedTransaction.title}</Text>
                <Text style={styles.transactionDetailsCategory}>{selectedTransaction.category}</Text>

                <Text style={styles.transactionDetailsAmount}>
                  -${typeof selectedTransaction.amount === 'number' ? selectedTransaction.amount.toFixed(2) : '0.00'}
                </Text>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Date</Text>
                  <Text style={styles.transactionDetailsValue}>{selectedTransaction.date}, 2023</Text>
                </View>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Time</Text>
                  <Text style={styles.transactionDetailsValue}>12:30 PM</Text>
                </View>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Transaction ID</Text>
                  <Text style={styles.transactionDetailsValue}>#TRX{selectedTransaction.id.toString().padStart(4, '0')}</Text>
                </View>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Payment Method</Text>
                  <View style={styles.transactionDetailsMethod}>
                    <View style={[styles.transactionMethodIcon, { backgroundColor: '#FF6384' }]}>
                      <Ionicons name="card" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.transactionDetailsValue}>Credit Card</Text>
                  </View>
                </View>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Status</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.transactionDetailsValue, { color: '#4CAF50' }]}>Completed</Text>
                  </View>
                </View>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Notes</Text>
                  <Text style={styles.transactionDetailsValue} numberOfLines={2}>
                    {selectedTransaction.title === 'Grocery Shopping' ? 'Weekly grocery run at Trader Joe\'s.' :
                     selectedTransaction.title === 'Uber Ride' ? 'Business trip to downtown meeting.' :
                     selectedTransaction.title === 'New Headphones' ? 'Sony WH-1000XM4 noise cancelling headphones.' :
                     'No notes available.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.editTransactionButton}
                  onPress={() => {
                    // Handle edit action
                    setTransactionDetailsVisible(false);
                  }}
                >
                  <Text style={styles.editTransactionButtonText}>Edit Transaction</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  screenPadding: {
    padding: 15,
  },
  overviewContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  balance: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  tilesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tile: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 12,
    width: '49%',
    position: 'relative',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tileTouched: {
    backgroundColor: '#252525',
  },
  tileLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  tileAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  earnedAmount: {
    color: '#4BC0C0',
  },
  spentAmount: {
    color: '#FF6384',
  },
  tileIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0.8,
  },
  activityContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 25,
  },
  chartAndLegendWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalSpentBox: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
    width: '60%',
  },
  totalSpentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  totalSpentLabel: {
    fontSize: 14,
    color: '#999999',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 0,
    marginVertical: 15,
  },
  chartCenterView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCenterContent: {
    width: INNER_RADIUS * 1.9,
    height: INNER_RADIUS * 1.9,
    borderRadius: INNER_RADIUS * 0.95,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  chartCenterValue: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartCenterLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: 10,
  },
  legendGrid: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#252525',
    borderRadius: 12,
  },
  legendColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 15,
  },
  legendLabel: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  activeLegendItem: {
    backgroundColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  expenseContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 3,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#888888',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  expenseDate: {
    fontSize: 13,
    color: '#888888',
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
  amountInput: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 10,
  },
  input: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 10,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    minWidth: width / 3 - 20,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    color: '#ffffff',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    minWidth: width / 3 - 20,
  },
  addCategoryText: {
    fontSize: 14,
    color: '#D26A68',
    marginLeft: 5,
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    backgroundColor: '#252525',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 20,
    margin: 8,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  tapText: {
    fontSize: 12,
    marginLeft: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 8,
  },
  netWorthActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4BC0C0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '42%',
  },
  netWorthActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  statsText: {
    fontSize: 12,
    marginLeft: 5,
  },
  statsSummaryCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
  },
  statsSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 4,
  },
  timeFrameOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeFrameSelected: {
    backgroundColor: '#333333',
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeFrameText: {
    fontSize: 12,
    color: '#999999',
  },
  timeFrameTextSelected: {
    color: '#FFFFFF',
  },
  statsCardTitle: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  statsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginTop: 10,
    marginBottom: 15,
    width: '100%',
  },
  statsMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  statsMetricItem: {
    alignItems: 'center',
    width: '30%',
  },
  statsMetricIcon: {
    marginBottom: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsMetricIconBg: {
    backgroundColor: '#4BC0C0',
    borderRadius: 18,
    padding: 8,
    overflow: 'hidden',
  },
  statsMetricValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
  },
  statsMetricLabel: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  statsTrendCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
  },
  statsSectionTitle: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 15,
  },
  trendChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  trendBarWrapper: {
    alignItems: 'center',
    width: '14%',
  },
  trendBar: {
    width: '70%',
    backgroundColor: '#4BC0C0',
    borderRadius: 3,
  },
  trendBarLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  statsDetailCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
  },
  statsBarContainer: {
    marginTop: 10,
  },
  statsBarItemEnhanced: {
    marginBottom: 16,
  },
  statsBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsBarLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBarValueContainer: {
    alignItems: 'flex-end',
  },
  statsBarPercentage: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statsBarLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  statsBarValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsBarBackground: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statsBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsSourceList: {
    marginTop: 5,
  },
  statsSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
  },
  statsSourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsSourceInfo: {
    flex: 1,
  },
  statsSourceName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsSourceCount: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  statsSourceAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsBudgetCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
  },
  budgetProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  budgetProgressItem: {
    alignItems: 'center',
  },
  budgetCircleContainer: {
    width: 110,
    height: 110,
    position: 'relative',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCircleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 55,
    borderWidth: 8,
    borderColor: '#333333',
  },
  budgetCircleProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 55,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  budgetCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCirclePercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  budgetCircleLabel: {
    fontSize: 12,
    color: '#999999',
  },
  budgetProgressLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsPieContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  monthlyStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  transactionDetailsContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  transactionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6384',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionDetailsTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  transactionDetailsCategory: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 20,
  },
  transactionDetailsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6384',
    marginBottom: 30,
  },
  transactionDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  transactionDetailsLabel: {
    fontSize: 16,
    color: '#888888',
  },
  transactionDetailsValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  transactionDetailsMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionMethodIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  editTransactionButton: {
    backgroundColor: '#D26A68',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  editTransactionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles for stats tabs
  statsTabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  statsTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  statsTabActive: {
    backgroundColor: '#252525',
  },
  statsTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999999',
    marginLeft: 8,
  },
  statsTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paginationDots: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
    justifyContent: 'center',
    height: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#D26A68',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContentContainer: {
    paddingHorizontal: 0,
  },
  overviewContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: screenWidth - 30, // Full width minus padding
    alignItems: 'center',
  },
  financialCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tileTrend: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  miniActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  carouselWrapper: {
    width: screenWidth - 30,
    alignSelf: 'center',
  },
  swipeableSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  swipeableContent: {
    paddingHorizontal: 20,
    paddingRight: 10,
  },
  swipeableTile: {
    width: 280,
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  tileContent: {
    flex: 1,
  },
  tileTitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 6,
  },
  categoryList: {
    marginTop: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  noTransactionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTransactionsText: {
    color: '#888888',
    fontSize: 16,
  },
  chartTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noDataText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noExpensesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noExpensesText: {
    color: '#888888',
    fontSize: 16,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '40%',
    left: '35%',
    backgroundColor: '#1a1a1a',
    borderRadius: 40,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  centerLabelText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  chartWithDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  chartWrapper: {
    flex: 2,
  },
  chartDetails: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  totalContainer: {
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectedCategoryContainer: {
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 12,
  },
  selectedCategoryLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 5,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedCategoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  selectedCategoryPercentage: {
    fontSize: 14,
    color: '#999999',
  },
  totalInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 12,
  },
  totalSpentTitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 8,
  },
  totalSpentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  selectedCategoryInfo: {
    width: '100%',
    backgroundColor: '#252525',
    borderRadius: 12,
    marginTop: 10,
  },
  selectedCategoryHeader: {
    borderLeftWidth: 4,
    padding: 15,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedCategoryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  selectedCategoryPercentage: {
    fontSize: 14,
    color: '#999999',
  },
});

export default HomeScreen;
