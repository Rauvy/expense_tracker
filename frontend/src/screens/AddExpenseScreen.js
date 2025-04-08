import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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

const TransactionsScreen = () => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'expense', 'income'
  
  // Filter transactions based on selected type
  const filteredTransactions = filterType === 'all' 
    ? allTransactions 
    : allTransactions.filter(transaction => transaction.type === filterType);
  
  // Calculate total income and expenses
  const totalIncome = allTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  const totalExpenses = allTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
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
                    <Ionicons name="arrow-down" size={18} color="#4BC0C0" />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={[styles.summaryAmount, styles.incomeAmount]}>${totalIncome.toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="arrow-up" size={18} color="#FF6384" />
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
            </View>
            
            {/* Transactions List */}
            <View style={styles.transactionsContainer}>
              {filteredTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
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
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
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
    color: '#4BC0C0',
  },
  expenseAmount: {
    color: '#FF6384',
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
  activeFilterButton: {
    backgroundColor: '#276EF1',
  },
  activeIncomeButton: {
    backgroundColor: '#4BC0C0',
  },
  activeExpenseButton: {
    backgroundColor: '#FF6384',
  },
  filterText: {
    color: '#888888',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
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
});

export default TransactionsScreen; 