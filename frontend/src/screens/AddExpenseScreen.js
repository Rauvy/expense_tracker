import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar, SafeAreaView, Modal, TextInput, Switch, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

// Extract unique categories from transactions, separated by type
const extractCategories = (transactions, type = null) => {
  const filtered = type ? transactions.filter(item => item.type === type) : transactions;
  const categories = filtered.map(item => item.category);
  return [...new Set(categories)];
};

const TransactionsScreen = () => {
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
  
  // Get all categories, expense categories, and income categories
  const allCategories = extractCategories(allTransactions);
  const expenseCategories = extractCategories(allTransactions, 'expense');
  const incomeCategories = extractCategories(allTransactions, 'income');
  
  // Determine which categories to show based on the filter type (memoized)
  const categoriesToShow = useCallback(() => {
    return filterType === 'expense' 
      ? expenseCategories 
      : filterType === 'income' 
        ? incomeCategories 
        : allCategories;
  }, [filterType, expenseCategories, incomeCategories, allCategories]);
  
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
  
  // Get category color based on the category name
  const getCategoryColor = useCallback((category) => {
    const transaction = allTransactions.find(t => t.category === category);
    return transaction ? transaction.color : COLORS.BLUE;
  }, [allTransactions]);

  // Render the filter modal content
  const renderModalContent = useCallback(() => {
    const currentCategories = categoriesToShow();
    
    const sections = [
      { 
        id: 'search',
        type: 'search',
        title: 'Search by name',
        value: searchQuery,
        onChangeText: setSearchQuery
      },
      {
        id: 'categories',
        type: 'categories',
        title: filterType === 'all' ? 'Categories' : 
               filterType === 'income' ? 'Income Categories' : 'Expense Categories',
        data: currentCategories,
        selected: selectedCategories,
        onSelect: toggleCategory
      },
      {
        id: 'date',
        type: 'date',
        title: 'Date Range',
        startDate: dateRange.start,
        endDate: dateRange.end,
        onChangeStart: (text) => setDateRange({...dateRange, start: text}),
        onChangeEnd: (text) => setDateRange({...dateRange, end: text})
      },
      {
        id: 'amount',
        type: 'amount',
        title: 'Amount Range',
        minAmount: amountRange.min,
        maxAmount: amountRange.max,
        onChangeMin: (text) => setAmountRange({...amountRange, min: text}),
        onChangeMax: (text) => setAmountRange({...amountRange, max: text})
      }
    ];
    
    const renderItem = ({ item }) => {
      switch (item.type) {
        case 'search':
          return (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{item.title}</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor="#888888"
                value={item.value}
                onChangeText={item.onChangeText}
              />
            </View>
          );
        
        case 'categories':
          return (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{item.title}</Text>
              <View style={styles.categoriesContainer}>
                {item.data.map((category) => {
                  const categoryColor = getCategoryColor(category);
                  const isSelected = item.selected.includes(category);
                  
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        isSelected && { backgroundColor: categoryColor }
                      ]}
                      onPress={() => item.onSelect(category)}
                    >
                      <Text 
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.selectedCategoryChipText
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
          
        case 'date':
          return (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{item.title}</Text>
              <View style={styles.rangeInputsContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>From</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#888888"
                    value={item.startDate}
                    onChangeText={item.onChangeStart}
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#888888"
                    value={item.endDate}
                    onChangeText={item.onChangeEnd}
                  />
                </View>
              </View>
            </View>
          );
          
        case 'amount':
          return (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{item.title}</Text>
              <View style={styles.rangeInputsContainer}>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountInputLabel}>Min $</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#888888"
                    keyboardType="numeric"
                    value={item.minAmount}
                    onChangeText={item.onChangeMin}
                  />
                </View>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountInputLabel}>Max $</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="9999.99"
                    placeholderTextColor="#888888"
                    keyboardType="numeric"
                    value={item.maxAmount}
                    onChangeText={item.onChangeMax}
                  />
                </View>
              </View>
            </View>
          );
          
        default:
          return null;
      }
    };
    
    return (
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          isKeyboardVisible && Platform.OS === 'ios' ? { height: '95%' } : null
        ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Container for the scrollable content */}
          <View style={{ flex: 1, paddingBottom: 80 }}>
            <FlatList
              data={sections}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => Keyboard.dismiss()}
              ListFooterComponent={<View style={{ height: 150 }} />}
            />
          </View>
          
          {/* Fixed footer */}
          <View style={styles.fixedFilterFooter}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: COLORS.BLUE }]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    getCategoryColor,
    toggleCategory
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
                    const categoryColor = getCategoryColor(cat);
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
});

export default TransactionsScreen; 