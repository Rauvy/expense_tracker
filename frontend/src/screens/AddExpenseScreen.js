import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data for all expenses
const allExpenses = [
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
  {
    id: 4,
    title: 'Electricity Bill',
    category: 'Bills',
    amount: 75.40,
    date: '10 Jun',
    icon: 'flash',
    color: '#4BC0C0',
  },
  {
    id: 5,
    title: 'Coffee Shop',
    category: 'Food',
    amount: 12.99,
    date: '9 Jun',
    icon: 'cafe',
    color: '#FF6384',
  },
  {
    id: 6,
    title: 'Movie Tickets',
    category: 'Entertainment',
    amount: 32.00,
    date: '8 Jun',
    icon: 'film',
    color: '#9966FF',
  },
];

// Available icons for custom categories
const availableIcons = [
  'basketball', 'airplane', 'book', 'briefcase', 'calculator', 
  'calendar', 'camera', 'color-palette', 'desktop', 'fitness',
  'gift', 'glasses', 'home', 'medical', 'paw', 'school'
];

// Initial categories
const initialCategories = [
  { name: 'Food', icon: 'fast-food', color: '#FF6384' },
  { name: 'Transport', icon: 'car', color: '#36A2EB' },
  { name: 'Shopping', icon: 'cart', color: '#FFCE56' },
  { name: 'Bills', icon: 'flash', color: '#4BC0C0' },
  { name: 'Entertainment', icon: 'film', color: '#9966FF' },
];

const AddExpenseScreen = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#276EF1');
  const [categories, setCategories] = useState(initialCategories);
  
  // Predefined colors for custom categories
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8C9EFF', '#FF5252'];
  
  const addCustomCategory = () => {
    if (customCategoryName.trim() && selectedIcon) {
      const newCategory = {
        name: customCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor
      };
      
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory.name);
      setCustomModalVisible(false);
      
      // Reset form
      setCustomCategoryName('');
      setSelectedIcon(null);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.screenPadding}>
          {/* Add Expense Section */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>Add Expense</Text>
              <Ionicons name="add-circle" size={24} color="#276EF1" />
            </View>
            
            <TextInput
              style={styles.amountInput}
              placeholder="$0.00"
              placeholderTextColor="#666666"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#666666"
              value={description}
              onChangeText={setDescription}
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
                onPress={() => setCustomModalVisible(true)}
              >
                <Ionicons name="add" size={20} color="#276EF1" />
                <Text style={styles.addCategoryText}>Custom</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
          
          {/* All Expenses Section */}
          <View style={styles.expensesContainer}>
            <Text style={styles.sectionTitle}>All Expenses</Text>
            <Text style={styles.sectionSubtitle}>Your complete expense history</Text>
            
            {allExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
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
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Custom Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customModalVisible}
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Category</Text>
              <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
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
            
            <Text style={styles.modalLabel}>Select Icon</Text>
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
            
            <Text style={styles.modalLabel}>Select Color</Text>
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
              style={[styles.createButton, { backgroundColor: selectedColor }]}
              onPress={addCustomCategory}
            >
              <Text style={styles.buttonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  formContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  amountInput: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#276EF1',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    color: '#276EF1',
    fontSize: 14,
    marginLeft: 5,
  },
  addButton: {
    backgroundColor: '#276EF1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  expensesContainer: {
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: width - 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default AddExpenseScreen; 