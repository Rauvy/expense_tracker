import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar, SafeAreaView, Modal, TextInput, Switch, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Colors imported from HomeScreen.js
const COLORS = {
  EXPENSE: '#FF6384',
  INCOME: '#4BC0C0',
  TRANSPORT: '#36A2EB',
  SHOPPING: '#FFCE56',
  BILLS: '#4BC0C0',
  ENTERTAINMENT: '#9966FF',
  BLUE: '#276EF1'
};

// Mock data for all transactions (both expenses and income)
const allTransactions = [
  {
    id: 1,
    title: 'Grocery Shopping',
    category: 'Food',
    amount: 85.25,
    date: '15 Jun',
    icon: 'fast-food',
    color: '#FF6384',
    paymentMethod: 'Credit Card',
    paymentIcon: 'card',
    paymentColor: '#FF6384',
    type: 'expense',
  },
  {
    id: 2,
    title: 'Monthly Salary',
    category: 'Salary',
    amount: 2800.00,
    date: '15 Jun',
    icon: 'cash',
    color: '#4BC0C0',
    source: 'Employer',
    sourceIcon: 'business',
    sourceColor: '#4BC0C0',
    type: 'income',
  },
  {
    id: 3,
    title: 'Uber Ride',
    category: 'Transport',
    amount: 24.50,
    date: '14 Jun',
    icon: 'car',
    color: '#36A2EB',
    paymentMethod: 'Mobile Pay',
    paymentIcon: 'phone-portrait',
    paymentColor: '#9966FF',
    type: 'expense',
  },
  {
    id: 4,
    title: 'Freelance Project',
    category: 'Freelance',
    amount: 350.00,
    date: '13 Jun',
    icon: 'laptop',
    color: '#36A2EB',
    source: 'Client',
    sourceIcon: 'person',
    sourceColor: '#36A2EB',
    type: 'income',
  },
  {
    id: 5,
    title: 'New Headphones',
    category: 'Shopping',
    amount: 159.99,
    date: '12 Jun',
    icon: 'cart',
    color: '#FFCE56',
    paymentMethod: 'Credit Card',
    paymentIcon: 'card',
    paymentColor: '#FF6384',
    type: 'expense',
  },
  {
    id: 6,
    title: 'Electricity Bill',
    category: 'Bills',
    amount: 75.40,
    date: '10 Jun',
    icon: 'flash',
    color: '#4BC0C0',
    paymentMethod: 'Cash',
    paymentIcon: 'cash',
    paymentColor: '#4BC0C0',
    type: 'expense',
  },
  {
    id: 7,
    title: 'Gift from Dad',
    category: 'Gifts',
    amount: 100.00,
    date: '10 Jun',
    icon: 'gift',
    color: '#9966FF',
    source: 'Family',
    sourceIcon: 'people',
    sourceColor: '#9966FF',
    type: 'income',
  },
  {
    id: 8,
    title: 'Coffee Shop',
    category: 'Food',
    amount: 12.99,
    date: '9 Jun',
    icon: 'cafe',
    color: '#FF6384',
    paymentMethod: 'Mobile Pay',
    paymentIcon: 'phone-portrait',
    paymentColor: '#9966FF',
    type: 'expense',
  },
  {
    id: 9,
    title: 'Movie Tickets',
    category: 'Entertainment',
    amount: 32.00,
    date: '8 Jun',
    icon: 'film',
    color: '#9966FF',
    paymentMethod: 'Credit Card',
    paymentIcon: 'card',
    paymentColor: '#FF6384',
    type: 'expense',
  },
  {
    id: 10,
    title: 'Stock Dividend',
    category: 'Investments',
    amount: 75.50,
    date: '7 Jun',
    icon: 'trending-up',
    color: '#FFCE56',
    source: 'Investments',
    sourceIcon: 'stats-chart',
    sourceColor: '#FFCE56',
    type: 'income',
  },
];

const AddExpenseScreen = ({ navigation }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'expense', 'income'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [transactionDetailsVisible, setTransactionDetailsVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    searchQuery: ''
  });

  // Using state for categories
  const [categories, setCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  // Load categories from AsyncStorage
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

  // Get current categories based on filter type
  const categoriesToShow = useCallback(() => {
    if (filterType === 'income') {
      return incomeCategories.map(cat => cat.name);
    } else {
      return categories.map(cat => cat.name);
    }
  }, [categories, incomeCategories, filterType]);

  // Get category color and icon
  const getCategoryDetails = useCallback((categoryName) => {
    const categoryList = filterType === 'income' ? incomeCategories : categories;
    const category = categoryList.find(cat => cat.name === categoryName);

    return category || { color: '#276EF1', icon: 'ellipsis-horizontal' };
  }, [categories, incomeCategories, filterType]);

  // Filter transactions based on selected type and advanced filters
  const filteredTransactions = allTransactions.filter(transaction => {
    // Basic type filter
    if (filterType !== 'all' && transaction.type !== filterType) return false;

    // Advanced filters
    // Category filter
    if (appliedFilters.categories.length > 0 &&
        !appliedFilters.categories.includes(transaction.category)) {
      return false;
    }

    // Search query filter (name/title)
    if (appliedFilters.searchQuery &&
        !transaction.title.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase())) {
      return false;
    }

    // Amount range filter
    if (appliedFilters.amountRange.min && transaction.amount < parseFloat(appliedFilters.amountRange.min)) {
      return false;
    }
    if (appliedFilters.amountRange.max && transaction.amount > parseFloat(appliedFilters.amountRange.max)) {
      return false;
    }

    // Date filter would go here if we had proper date objects
    // For the mock data, we'd need to convert the string dates to Date objects

    return true;
  });

  // Calculate total income and expenses
  const totalIncome = allTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = allTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Initialize modal state when opening
  useEffect(() => {
    if (showFilterModal) {
      setSearchQuery(appliedFilters.searchQuery);
      setSelectedCategories([...appliedFilters.categories]);
      setDateRange({...appliedFilters.dateRange});
      setAmountRange({...appliedFilters.amountRange});
    }
  }, [showFilterModal]);

  // Reset selected categories when filter type changes
  useEffect(() => {
    if (showFilterModal) {
      setSelectedCategories([]);
    }
  }, [filterType, showFilterModal]);

  // Добавим состояние для отслеживания видимости клавиатуры
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Эффект для отслеживания появления/скрытия клавиатуры
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow', () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide', () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const renderFilterButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === value && styles.activeFilterButton,
        value === 'income' && filterType === value && styles.activeIncomeButton,
        value === 'expense' && filterType === value && styles.activeExpenseButton
      ]}
      onPress={() => setFilterType(value)}
    >
      <Text
        style={[
          styles.filterText,
          filterType === value && styles.activeFilterText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const toggleCategory = useCallback((category) => {
    setSelectedCategories(prevCategories => {
      if (prevCategories.includes(category)) {
        return prevCategories.filter(cat => cat !== category);
      } else {
        return [...prevCategories, category];
      }
    });
  }, []);

  const applyFilters = () => {
    setAppliedFilters({
      categories: selectedCategories,
      dateRange: dateRange,
      amountRange: amountRange,
      searchQuery: searchQuery
    });
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setSearchQuery('');
    setAppliedFilters({
      categories: [],
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      searchQuery: ''
    });
  };

  // Completely rewrite the renderModalContent function to implement a better design
  const renderModalContent = useCallback(() => {
    const currentCategories = categoriesToShow();

    return (
      <View style={styles.filterModalContainer}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <TouchableOpacity
              style={styles.filterModalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="chevron-down" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity
              style={styles.filterModalResetButton}
              onPress={resetFilters}
            >
              <Text style={styles.filterModalResetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterModalScrollView}
            contentContainerStyle={styles.filterModalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Search</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#999999" style={styles.searchInputIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search transactions..."
                  placeholderTextColor="#999999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#999999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.filterDivider} />

            {/* Categories Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {filterType === 'all' ? 'Categories' :
                 filterType === 'income' ? 'Income Categories' : 'Expense Categories'}
              </Text>
              <View style={styles.categoriesContainer}>
                {currentCategories.map((category) => {
                  const { color } = getCategoryDetails(category);
                  const isSelected = selectedCategories.includes(category);

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        isSelected && { backgroundColor: color, borderColor: color }
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        isSelected && styles.selectedCategoryChipText
                      ]}>
                        {category}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" style={styles.categoryCheckmark} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterDivider} />

            {/* Date Range Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.rangeInputsContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>From</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#999999"
                      value={dateRange.start}
                      onChangeText={(text) => setDateRange({...dateRange, start: text})}
                    />
                    <Ionicons name="calendar" size={20} color="#999999" style={styles.dateInputIcon} />
                  </View>
                </View>

                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#999999"
                      value={dateRange.end}
                      onChangeText={(text) => setDateRange({...dateRange, end: text})}
                    />
                    <Ionicons name="calendar" size={20} color="#999999" style={styles.dateInputIcon} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.filterDivider} />

            {/* Amount Range Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Amount Range</Text>
              <View style={styles.rangeInputsContainer}>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.amountInputLabel}>Minimum</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.amountInputPrefix}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#999999"
                      keyboardType="numeric"
                      value={amountRange.min}
                      onChangeText={(text) => setAmountRange({...amountRange, min: text})}
                    />
                  </View>
                </View>

                <View style={styles.amountInputWrapper}>
                  <Text style={styles.amountInputLabel}>Maximum</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.amountInputPrefix}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="Any"
                      placeholderTextColor="#999999"
                      keyboardType="numeric"
                      value={amountRange.max}
                      onChangeText={(text) => setAmountRange({...amountRange, max: text})}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              style={styles.filterApplyButton}
              onPress={applyFilters}
            >
              <Text style={styles.filterApplyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [
    categoriesToShow,
    searchQuery,
    selectedCategories,
    dateRange,
    amountRange,
    filterType,
    getCategoryDetails,
    toggleCategory,
    resetFilters,
    applyFilters
  ]);

  // Handle transaction click
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsVisible(true);
  };

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    return (
      <Modal
        visible={transactionDetailsVisible}
        transparent={true}
        animationType="slide"
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

                <Text style={[
                  styles.transactionDetailsAmount,
                  selectedTransaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {selectedTransaction.type === 'income' ? '+' : '-'}${selectedTransaction.amount.toFixed(2)}
                </Text>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Date</Text>
                  <Text style={styles.transactionDetailsValue}>{selectedTransaction.date}</Text>
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
                  <Text style={styles.transactionDetailsLabel}>
                    {selectedTransaction.type === 'income' ? 'Source' : 'Payment Method'}
                  </Text>
                  <View style={styles.transactionDetailsMethod}>
                    <View
                      style={[
                        styles.transactionMethodIcon,
                        {
                          backgroundColor: selectedTransaction.type === 'income'
                            ? selectedTransaction.sourceColor
                            : selectedTransaction.paymentColor
                        }
                      ]}
                    >
                      <Ionicons
                        name={selectedTransaction.type === 'income'
                          ? selectedTransaction.sourceIcon
                          : selectedTransaction.paymentIcon}
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.transactionDetailsValue}>
                      {selectedTransaction.type === 'income'
                        ? selectedTransaction.source
                        : selectedTransaction.paymentMethod}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionDetailsRow}>
                  <Text style={styles.transactionDetailsLabel}>Status</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.transactionDetailsValue, { color: '#4CAF50' }]}>Completed</Text>
                  </View>
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
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screenPadding}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Transactions</Text>
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="arrow-down" size={18} color={COLORS.INCOME} />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={[styles.summaryAmount, styles.incomeAmount]}>${totalIncome.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="arrow-up" size={18} color={COLORS.EXPENSE} />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={[styles.summaryAmount, styles.expenseAmount]}>${totalExpenses.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
              {renderFilterButton('All', 'all')}
              {renderFilterButton('Income', 'income')}
              {renderFilterButton('Expenses', 'expense')}
              <TouchableOpacity
                style={styles.advancedFilterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <Ionicons name="options" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Active Filters Display */}
            {(appliedFilters.categories.length > 0 ||
              appliedFilters.searchQuery ||
              appliedFilters.amountRange.min ||
              appliedFilters.amountRange.max) && (
              <View style={styles.activeFiltersContainer}>
                <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.activeFiltersScroll}
                >
                  {appliedFilters.categories.map(cat => {
                    const categoryColor = getCategoryDetails(cat).color;
                    return (
                      <View key={cat} style={[styles.activeFilterChip, { backgroundColor: categoryColor }]}>
                        <Text style={styles.activeFilterChipText}>{cat}</Text>
                      </View>
                    );
                  })}

                  {appliedFilters.searchQuery && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterChipText}>
                        "{appliedFilters.searchQuery}"
                      </Text>
                    </View>
                  )}

                  {(appliedFilters.amountRange.min || appliedFilters.amountRange.max) && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterChipText}>
                        ${appliedFilters.amountRange.min || '0'} - ${appliedFilters.amountRange.max || '∞'}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.clearFiltersButton, { backgroundColor: COLORS.EXPENSE }]}
                    onPress={resetFilters}
                  >
                    <Text style={styles.clearFiltersText}>Clear All</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {/* Transactions List */}
            <View style={styles.transactionsContainer}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TouchableOpacity
                    key={transaction.id}
                    style={styles.transactionItem}
                    activeOpacity={0.7}
                    onPress={() => handleTransactionClick(transaction)}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: transaction.color }]}>
                      <Ionicons name={transaction.icon} size={20} color="#FFFFFF" />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    </View>

                    <View style={styles.transactionDetails}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                        ]}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>

                      <View
                        style={[
                          styles.transactionMethodIcon,
                          {
                            backgroundColor: transaction.type === 'income'
                              ? transaction.sourceColor
                              : transaction.paymentColor
                          }
                        ]}
                      >
                        <Ionicons
                          name={transaction.type === 'income' ? transaction.sourceIcon : transaction.paymentIcon}
                          size={14}
                          color="#FFFFFF"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noTransactionsContainer}>
                  <Text style={styles.noTransactionsText}>No transactions found</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        {renderModalContent()}
      </Modal>

      {/* Transaction Details Modal */}
      {renderTransactionDetails()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
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
    padding: 10,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: COLORS.INCOME,
  },
  expenseAmount: {
    color: COLORS.EXPENSE,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
    marginHorizontal: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 5,
    borderRadius: 10,
  },
  advancedFilterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#555555',
    marginLeft: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: COLORS.BLUE,
  },
  activeIncomeButton: {
    backgroundColor: COLORS.INCOME,
  },
  activeExpenseButton: {
    backgroundColor: COLORS.EXPENSE,
  },
  filterText: {
    color: '#888888',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  activeFiltersContainer: {
    marginBottom: 15,
  },
  activeFiltersTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  activeFiltersScroll: {
    flexDirection: 'row',
  },
  activeFilterChip: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginRight: 8,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.EXPENSE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  transactionsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 3,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#888888',
  },
  transactionDetails: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 5,
  },
  transactionMethodIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  noTransactionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noTransactionsText: {
    color: '#888888',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  transactionDetailsContent: {
    alignItems: 'center',
    paddingVertical: 20,
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
    backgroundColor: COLORS.BLUE,
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
  // Filter Modal Styles
  filterModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModalContent: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterModalCloseButton: {
    padding: 4,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterModalResetButton: {
    padding: 4,
  },
  filterModalResetText: {
    fontSize: 16,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  filterModalScrollView: {
    flex: 1,
  },
  filterModalScrollContent: {
    paddingBottom: 30,
  },
  filterModalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  filterSection: {
    padding: 20,
  },
  filterDivider: {
    height: 8,
    backgroundColor: '#121212',
  },
  filterSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 18,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInputIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
  },
  categoryChipText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryCheckmark: {
    marginLeft: 6,
  },
  rangeInputsContainer: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  dateInputWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  dateInputLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  dateInputIcon: {
    marginLeft: 10,
  },
  amountInputWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  amountInputLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  amountInputPrefix: {
    color: '#999999',
    fontSize: 16,
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  filterApplyButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterApplyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddExpenseScreen;
