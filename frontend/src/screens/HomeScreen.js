import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated, Modal, TextInput, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

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

const HomeScreen = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
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
  const [categories, setCategories] = useState(initialCategories);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [incomeCategories, setIncomeCategories] = useState(initialIncomeCategories);
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

  // State for statistics screen
  const [activeStatsTab, setActiveStatsTab] = useState('expense');

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
    // Here you would add the expense to your data
    // Then clear the form and close the modal
    setExpenseAmount('');
    setExpenseDescription('');
    setSelectedCategory(null);
    setSelectedPaymentMethod(null);
    setExpenseModalVisible(false);
  };

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

  // Handle statistics tab change
  const handleStatsTabChange = (tab) => {
    setActiveStatsTab(tab);
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
          {/* Overview Section */}
          <View style={styles.overviewContainer}>
            <View style={styles.overviewHeader}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Ionicons name="wallet-outline" size={24} color="#276EF1" />
            </View>
            
            <Text style={styles.balance}>$2,450.00</Text>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            
            {/* Add Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#4BC0C0'}]}
                activeOpacity={0.7}
                onPress={() => setIncomeModalVisible(true)}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Income</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#FF6384'}]}
                activeOpacity={0.7}
                onPress={() => setExpenseModalVisible(true)}
              >
                <Ionicons name="remove-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
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
                  onPress={() => setCustomIncomeCategoryModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#276EF1" />
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
                  onPress={() => setCustomIncomeSourceModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#276EF1" />
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
                <Text style={styles.modalTitle}>Create Custom Category</Text>
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
                {availableIcons.map((icon) => (
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
                    const newCategory = {
                      name: customCategoryName.trim(),
                      icon: selectedIcon,
                      color: selectedColor || '#276EF1'
                    };
                    
                    setCategories([...categories, newCategory]);
                    setSelectedCategory(newCategory.name);
                    setCustomCategoryModalVisible(false);
                    
                    // Reset form
                    setCustomCategoryName('');
                    setSelectedIcon(null);
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
                    const newCategory = {
                      name: customIncomeCategoryName.trim(),
                      icon: selectedIncomeIcon,
                      color: selectedIncomeColor || '#4BC0C0'
                    };
                    
                    setIncomeCategories([...incomeCategories, newCategory]);
                    setSelectedIncomeCategory(newCategory.name);
                    setCustomIncomeCategoryModalVisible(false);
                    
                    // Reset form
                    setCustomIncomeCategoryName('');
                    setSelectedIncomeIcon(null);
                  }
                }}
              >
                <Text style={styles.buttonText}>Create Category</Text>
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
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            {selectedTransaction && (
              <View style={styles.transactionDetailsContainer}>
                {/* Transaction Header */}
                <View style={styles.transactionHeaderContainer}>
                  <View style={[styles.transactionDetailIcon, { backgroundColor: selectedTransaction.color }]}>
                    <Ionicons name={selectedTransaction.icon} size={30} color="#FFFFFF" />
                  </View>
                  
                  <View style={styles.transactionHeaderInfo}>
                    <Text style={styles.transactionTitle}>{selectedTransaction.title}</Text>
                    <Text style={styles.transactionCategory}>{selectedTransaction.category}</Text>
                  </View>
                  
                  <Text style={styles.transactionAmount}>-${selectedTransaction.amount.toFixed(2)}</Text>
                </View>
                
                {/* Transaction Details */}
                <View style={styles.transactionInfoSection}>
                  <View style={styles.transactionInfoRow}>
                    <Text style={styles.transactionInfoLabel}>Date</Text>
                    <Text style={styles.transactionInfoValue}>{selectedTransaction.date}, 2023</Text>
                  </View>
                  
                  <View style={styles.transactionInfoRow}>
                    <Text style={styles.transactionInfoLabel}>Category</Text>
                    <View style={styles.transactionCategoryTag}>
                      <View style={[styles.miniCategoryDot, { backgroundColor: selectedTransaction.color }]} />
                      <Text style={styles.transactionCategoryText}>{selectedTransaction.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.transactionInfoRow}>
                    <Text style={styles.transactionInfoLabel}>Payment Method</Text>
                    <View style={styles.transactionCategoryTag}>
                      <Ionicons name="card" size={14} color="#FF6384" />
                      <Text style={styles.transactionCategoryText}>Credit Card</Text>
                    </View>
                  </View>
                  
                  <View style={styles.transactionInfoRow}>
                    <Text style={styles.transactionInfoLabel}>Status</Text>
                    <View style={styles.transactionStatusTag}>
                      <Text style={styles.transactionStatusText}>Completed</Text>
                    </View>
                  </View>
                  
                  <View style={styles.transactionNotesContainer}>
                    <Text style={styles.transactionInfoLabel}>Notes</Text>
                    <View style={styles.transactionNotesCard}>
                      <Text style={styles.transactionNotesText}>
                        {selectedTransaction.title === 'Grocery Shopping' ? 'Weekly grocery run at Trader Joe\'s.' : 
                         selectedTransaction.title === 'Uber Ride' ? 'Business trip to downtown meeting.' :
                         selectedTransaction.title === 'New Headphones' ? 'Sony WH-1000XM4 noise cancelling headphones.' : 
                         'No notes available.'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Transaction Actions */}
                <View style={styles.transactionActionsContainer}>
                  <TouchableOpacity style={styles.transactionActionButton}>
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.transactionActionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.transactionActionButton, {backgroundColor: '#FF6384'}]}>
                    <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.transactionActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
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
    padding: 15,
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
    marginBottom: 8,
  },
  tileAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
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
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  modalTitle: {
    fontSize: 20,
    color: '#ffffff',
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
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    width: '48%',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  transactionDetailsContainer: {
    marginBottom: 20,
  },
  transactionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  transactionDetailIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionHeaderInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#999999',
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 20,
    color: '#FF6384',
    fontWeight: 'bold',
  },
  transactionInfoSection: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  transactionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionInfoLabel: {
    fontSize: 15,
    color: '#999999',
  },
  transactionInfoValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  transactionCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  transactionCategoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  transactionStatusTag: {
    backgroundColor: '#4BC0C0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  transactionStatusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  transactionNotesContainer: {
    marginTop: 10,
  },
  transactionNotesCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginTop: 8,
  },
  transactionNotesText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  transactionActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '48%',
  },
  transactionActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
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
});

export default HomeScreen; 