import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated, Modal, TextInput, SafeAreaView, Platform, FlatList, PanResponder, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TransactionsDetail from '../components/TransactionsDetail';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;

// Create an animated version of FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Constants for the chart size
const CHART_RADIUS = Math.min(width - 100, 240) / 2;
const INNER_RADIUS = CHART_RADIUS * 0.55;

// Mock data
const monthlyEarned = 2850;
const monthlySpent = 950;

// Initial categories
const initialCategories = [
  { name: 'Food', icon: 'fast-food', color: '#FF6384' },
  { name: 'Transport', icon: 'car', color: '#36A2EB' },
  { name: 'Shopping', icon: 'cart', color: '#FFCE56' },
  { name: 'Bills', icon: 'flash', color: '#4BC0C0' },
  { name: 'Entertainment', icon: 'film', color: '#9966FF' },
];

// Initial payment methods
const initialPaymentMethods = [
  { name: 'Credit Card', icon: 'card', color: '#FF6384' },
  { name: 'Cash', icon: 'cash', color: '#4BC0C0' },
  { name: 'Mobile Pay', icon: 'phone-portrait', color: '#9966FF' },
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
const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8C9EFF', '#FF5252'];

const categoryData = [
  {
    name: 'Food',
    amount: 450,
    color: '#FF6384',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
  {
    name: 'Transport',
    amount: 250,
    color: '#36A2EB',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
  {
    name: 'Shopping',
    amount: 200,
    color: '#FFCE56',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
  {
    name: 'Bills',
    amount: 150,
    color: '#4BC0C0',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
];

// Define initial expenses data
const initialExpenses = [
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

// Function to generate pie chart slices
const generatePieChartPath = (index, data, radius, innerRadius) => {
  // Calculate total
  const total = data.reduce((acc, item) => acc + item.amount, 0);

  // Calculate start and end angles
  let startAngle = 0;
  for (let i = 0; i < index; i++) {
    const angle = (data[i].amount / total) * 2 * Math.PI;
    startAngle += angle;
  }

  const angle = (data[index].amount / total) * 2 * Math.PI;
  const endAngle = startAngle + angle;

  // Calculate coordinates
  const centerX = radius;
  const centerY = radius;

  // Starting point
  const startX = centerX + Math.cos(startAngle) * radius;
  const startY = centerY + Math.sin(startAngle) * radius;

  // End point
  const endX = centerX + Math.cos(endAngle) * radius;
  const endY = centerY + Math.sin(endAngle) * radius;

  // Inner points for donut
  const innerStartX = centerX + Math.cos(startAngle) * innerRadius;
  const innerStartY = centerY + Math.sin(startAngle) * innerRadius;
  const innerEndX = centerX + Math.cos(endAngle) * innerRadius;
  const innerEndY = centerY + Math.sin(endAngle) * innerRadius;

  // Large arc flag
  const largeArcFlag = angle > Math.PI ? 1 : 0;

  // Create SVG path with slightly adjusted padding for better appearance
  return `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
    L ${innerEndX} ${innerEndY}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
    Z
  `;
};

const HomeScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Add state for recent expenses
  const [recentExpenses, setRecentExpenses] = useState(initialExpenses);

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
  const [selectedColor, setSelectedColor] = useState('#276EF1');
  const [selectedPaymentColor, setSelectedPaymentColor] = useState('#276EF1');
  const [selectedIncomeColor, setSelectedIncomeColor] = useState('#276EF1');
  const [selectedSourceColor, setSelectedSourceColor] = useState('#276EF1');

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

  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [incomeCategories, setIncomeCategories] = useState([
    { name: 'Salary', icon: 'cash', color: '#4CD964' },
    { name: 'Freelance', icon: 'laptop', color: '#007AFF' },
    { name: 'Investments', icon: 'trending-up', color: '#FFCC00' },
    { name: 'Gifts', icon: 'gift', color: '#FF2D55' },
  ]);
  const [incomeSources, setIncomeSources] = useState(initialIncomeSources);

  // Calculate percentages and prepare data
  const total = categoryData.reduce((acc, item) => acc + item.amount, 0);
  const formattedCategoryData = categoryData.map((item) => ({
    ...item,
    percentage: Math.round((item.amount / total) * 100),
  }));

  // Add feedback state for buttons
  const [earnedTilePressed, setEarnedTilePressed] = useState(false);
  const [spentTilePressed, setSpentTilePressed] = useState(false);

  // State for statistics modals
  const [incomeStatsModalVisible, setIncomeStatsModalVisible] = useState(false);
  const [expenseStatsModalVisible, setExpenseStatsModalVisible] = useState(false);

  // State for transaction details modal
  const [transactionDetailsVisible, setTransactionDetailsVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Add state for transaction edit modal
  const [editTransactionModalVisible, setEditTransactionModalVisible] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState(null);

  // State for statistics screen
  const [activeStatsTab, setActiveStatsTab] = useState('expense');

  // Add state for financial overview
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const financialCards = [
    { title: 'Net Worth', value: 2450.00, trend: '+3.2%', color: '#276EF1' },
    { title: 'Assets', value: 16750.00, trend: '+2.1%', color: '#4BC0C0' },
    { title: 'Liabilities', value: 14300.00, trend: '-1.5%', color: '#FF6384' }
  ];

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
      {true && (
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
  const handleAddExpense = () => {
    if (!expenseAmount || !selectedCategory || !selectedPaymentMethod) {
      // In a real app, you'd show an error toast or alert
      console.log('Please fill in all expense details');
      return;
    }

    // Get the category details to extract icon and color
    const categoryDetails = categories.find(cat => cat.name === selectedCategory);
    const paymentDetails = paymentMethods.find(method => method.name === selectedPaymentMethod);

    // Generate a new transaction object
    const newExpense = {
      id: Date.now(),
      title: expenseDescription || selectedCategory,
      category: selectedCategory,
      amount: parseFloat(expenseAmount),
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      icon: categoryDetails?.icon || 'help-circle',
      color: categoryDetails?.color || '#FF6384',
      paymentMethod: selectedPaymentMethod,
      paymentIcon: paymentDetails?.icon || 'card',
      paymentColor: paymentDetails?.color || '#FF6384',
      type: 'expense',
    };

    // In a real app, you would save this to your data store or API
    console.log('New expense created:', newExpense);

    // Reset form and close modal
    setExpenseAmount('');
    setExpenseDescription('');
    setSelectedCategory(null);
    setSelectedPaymentMethod(null);
    setExpenseModalVisible(false);
  };

  // Создаем жест для свайпа вниз, чтобы закрыть модальное окно
  const closeExpenseModalGesture = Gesture.Pan().onUpdate((event) => {
    if (event.translationY > 50) {
      setExpenseModalVisible(false);
      setExpenseAmount('');
      setExpenseDescription('');
      setSelectedCategory(null);
      setSelectedPaymentMethod(null);
    }
  });

  // Handle add income
  const handleAddIncome = () => {
    // Here you would add the income to your data
    // Then clear the form and close the modal
    setIncomeAmount('');
    setIncomeDescription('');
    setSelectedIncomeCategory(null);
    setSelectedIncomeSource(null);
    setIncomeModalVisible(false);
  };

  // Handle transaction click
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsVisible(true);
  };

  // Handle edit transaction
  const handleEditTransaction = (updatedTransaction) => {
    // Update the transaction in our recentExpenses state
    const updatedExpenses = recentExpenses.map(expense => {
      if (expense.id === updatedTransaction.id) {
        return updatedTransaction;
      }
      return expense;
    });
    
    // Update the state with the modified expenses
    setRecentExpenses(updatedExpenses);
    
    // Close the modal
    setTransactionDetailsVisible(false);
  };

  // Handle save edited transaction
  const handleSaveEditedTransaction = () => {
    // Update the transaction in our sample data
    const updatedExpenses = recentExpenses.map(expense => {
      if (expense.id === editTransaction.id) {
        return {
          ...expense,
          amount: parseFloat(editAmount) || expense.amount,
          title: editDescription || expense.title,
          category: editCategory || expense.category,
          // Find the matching category to get the icon and color
          icon: categories.find(cat => cat.name === editCategory)?.icon || expense.icon,
          color: categories.find(cat => cat.name === editCategory)?.color || expense.color,
        };
      }
      return expense;
    });
    
    // Update the state with the modified expenses
    setRecentExpenses(updatedExpenses);
    
    // Close the modal
    setEditTransactionModalVisible(false);
    
    // Reset form
    setEditTransaction(null);
    setEditAmount('');
    setEditDescription('');
    setEditCategory(null);
    setEditPaymentMethod(null);
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
            { name: 'Food', icon: 'fast-food', color: '#FF9500' },
            { name: 'Transport', icon: 'car', color: '#5856D6' },
            { name: 'Shopping', icon: 'cart', color: '#FF2D55' },
            { name: 'Bills', icon: 'receipt', color: '#4BC0C0' },
            { name: 'Entertainment', icon: 'film', color: '#FF3B30' },
            { name: 'Health', icon: 'medical', color: '#34C759' },
            { name: 'Education', icon: 'school', color: '#007AFF' },
            { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
          ];
          setCategories(defaultCategories);
          await AsyncStorage.setItem('expenseCategories', JSON.stringify(defaultCategories));
        }

        if (storedIncomeCategories) {
          setIncomeCategories(JSON.parse(storedIncomeCategories));
        } else {
          // Set default income categories if none found
          const defaultIncomeCategories = [
            { name: 'Salary', icon: 'cash', color: '#4CD964' },
            { name: 'Freelance', icon: 'laptop', color: '#007AFF' },
            { name: 'Investments', icon: 'trending-up', color: '#FFCC00' },
            { name: 'Gifts', icon: 'gift', color: '#FF2D55' },
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

  // Handle delete transaction
  const handleDeleteTransaction = (transactionId) => {
    // Filter out the deleted transaction
    const updatedExpenses = recentExpenses.filter(expense => expense.id !== transactionId);
    
    // Update state and close modal
    setRecentExpenses(updatedExpenses);
    setTransactionDetailsVisible(false);
  };

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
            <Ionicons name="stats-chart" size={22} color="#276EF1" />
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
                {/* Pie Chart */}
                <Svg width={chartRadius * 2} height={chartRadius * 2}>
                  <G>
                    {formattedCategoryData.map((item, index) => (
                      <Path
                        key={index}
                        d={generatePieChartPath(index, categoryData, chartRadius, innerRadius)}
                        fill={item.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                        stroke="#1a1a1a"
                        strokeWidth={1}
                        onPress={() => handleSlicePress(index)}
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

                {/* Center Display */}
                <Animated.View style={[styles.chartCenterView, { opacity: fadeAnim }]}>
                  <View style={styles.chartCenterContent}>
                    <Text style={styles.chartCenterValue} numberOfLines={1} adjustsFontSizeToFit>
                      {activeIndex !== null
                        ? `$${formattedCategoryData[activeIndex].amount.toFixed(2)}`
                        : `$${total.toFixed(2)}`
                      }
                    </Text>
                    <Text style={styles.chartCenterLabel} numberOfLines={1}>
                      {activeIndex !== null
                        ? formattedCategoryData[activeIndex].name
                        : "Monthly Spent"
                      }
                    </Text>
                  </View>
                </Animated.View>
              </View>

              {/* Categories below the chart */}
              <View style={styles.legendContainer}>
                <View style={styles.legendGrid}>
                  {formattedCategoryData.map((category, index) => (
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
            <Text style={styles.sectionTitle}>Recent Expenses</Text>

            {recentExpenses.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseItem}
                activeOpacity={0.7}
                onPress={() => handleTransactionClick(expense)}
              >
                <View style={[styles.expenseIcon, { backgroundColor: expense.color }]}>
                  <Ionicons name={expense.icon} size={20} color="#FFFFFF" />
                </View>

                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseTitle}>{expense.title}</Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>

                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
                  <Text style={styles.expenseDate}>{expense.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button for adding expenses */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setExpenseModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

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
        <TouchableOpacity 
          onPress={() => {
            setExpenseModalVisible(false);
            setExpenseAmount('');
            setExpenseDescription('');
            setSelectedCategory(null);
            setSelectedPaymentMethod(null);
          }}
        >
          <View style={styles.modalOverlay} />
        </TouchableOpacity>
        
        <GestureHandlerRootView style={{ flex: 1, position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <GestureDetector gesture={closeExpenseModalGesture}>
                <View style={styles.pullTabContainer}>
                  <View style={styles.modalPullTab} />
                </View>
              </GestureDetector>
              
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
                    onPress={() => setCustomCategoryModalVisible(true)}
                  >
                    <Ionicons name="add" size={20} color="#276EF1" />
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
                    onPress={() => setCustomPaymentMethodModalVisible(true)}
                  >
                    <Ionicons name="add" size={20} color="#276EF1" />
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
        </GestureHandlerRootView>
      </Modal>

      {/* Custom Category Modal */}
      <Modal
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
                style={[styles.addButton, { backgroundColor: selectedColor || '#276EF1' }]}
                onPress={() => {
                  if (customCategoryName.trim() && selectedIcon) {
                    saveCategory({
                      name: customCategoryName.trim(),
                      icon: selectedIcon,
                      color: selectedColor || '#276EF1'
                    });
                  }
                }}
              >
                <Text style={styles.buttonText}>Create Category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Payment Method Modal */}
      <Modal
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
                style={[styles.addButton, { backgroundColor: selectedPaymentColor || '#276EF1' }]}
                onPress={() => {
                  if (customPaymentMethodName.trim() && selectedPaymentIcon) {
                    const newPaymentMethod = {
                      name: customPaymentMethodName.trim(),
                      icon: selectedPaymentIcon,
                      color: selectedPaymentColor || '#276EF1'
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
      </Modal>

      {/* Custom Income Category Modal */}
      <Modal
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
      </Modal>

      {/* Custom Income Source Modal */}
      <Modal
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
      </Modal>

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
                            {formattedCategoryData.map((item, index) => (
                              <Path
                                key={index}
                                d={generatePieChartPath(index, categoryData, chartRadius, innerRadius)}
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

                        <View style={styles.chartCenterView}>
                          <View style={styles.chartCenterContent}>
                            <Text style={styles.chartCenterValue} numberOfLines={1} adjustsFontSizeToFit>
                              ${total.toFixed(2)}
                            </Text>
                            <Text style={styles.chartCenterLabel} numberOfLines={1}>
                              Total Spent
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Category List */}
                    <View style={styles.statsBarContainer}>
                      {formattedCategoryData.map((category, index) => (
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
      <TransactionsDetail
        visible={transactionDetailsVisible}
        transaction={selectedTransaction}
        categories={categories}
        paymentMethods={paymentMethods}
        onClose={() => setTransactionDetailsVisible(false)}
        onSave={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Edit Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editTransactionModalVisible}
        onRequestClose={() => setEditTransactionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Transaction</Text>
                <TouchableOpacity
                  onPress={() => setEditTransactionModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Transaction Form */}
              <TextInput
                style={styles.amountInput}
                placeholder="$0.00"
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                value={editAmount}
                onChangeText={setEditAmount}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#666666"
                value={editDescription}
                onChangeText={setEditDescription}
              />

              <Text style={styles.categoryLabel}>Select Category</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryButton,
                      editCategory === category.name && { borderColor: category.color }
                    ]}
                    onPress={() => setEditCategory(category.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.categoryLabel}>Payment Method</Text>
              <View style={styles.categoriesContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.name}
                    style={[
                      styles.categoryButton,
                      editPaymentMethod === method.name && { borderColor: method.color }
                    ]}
                    onPress={() => setEditPaymentMethod(method.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: method.color }]}>
                      <Ionicons name={method.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryText}>{method.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: '#FF6384' }]}
                onPress={handleSaveEditedTransaction}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
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
    position: 'relative',
    height: CHART_RADIUS * 2,
    width: CHART_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
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
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#252525',
    borderRadius: 10,
  },
  legendColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
  },
  legendLabel: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  activeLegendItem: {
    backgroundColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
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
  },
  expenseCategory: {
    fontSize: 13,
    color: '#666666',
    marginTop: 3,
  },
  expenseDetails: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    color: '#FF6384',
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 13,
    color: '#666666',
    marginTop: 3,
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
    color: '#276EF1',
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
    backgroundColor: '#276EF1',
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
    backgroundColor: '#276EF1',
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
  deleteTransactionButton: {
    backgroundColor: '#FF6384',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  deleteTransactionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#276EF1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  
  pullTabContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalPullTab: {
    width: 60,
    height: 6,
    backgroundColor: '#444444',
    borderRadius: 3,
    opacity: 0,
  },
});

export default HomeScreen;
