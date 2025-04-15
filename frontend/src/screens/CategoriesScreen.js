import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoriesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('expense');
  const [categories, setCategories] = useState([
    { name: 'Food', icon: 'fast-food', color: '#FF9500' },
    { name: 'Shopping', icon: 'cart', color: '#5856D6' },
    { name: 'Transport', icon: 'car', color: '#FF2D55' },
    { name: 'Health', icon: 'fitness', color: '#4CD964' },
    { name: 'Entertainment', icon: 'film', color: '#FF9500' },
    { name: 'Education', icon: 'school', color: '#5AC8FA' },
    { name: 'Bills', icon: 'receipt', color: '#007AFF' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
  ]);
  const [incomeCategories, setIncomeCategories] = useState([
    { name: 'Salary', icon: 'cash', color: '#4CD964' },
    { name: 'Investments', icon: 'trending-up', color: '#007AFF' },
    { name: 'Freelance', icon: 'briefcase', color: '#5856D6' },
    { name: 'Gifts', icon: 'gift', color: '#FF2D55' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
  ]);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const availableIcons = ['home', 'car', 'restaurant', 'shirt', 'airplane', 'gift', 'medical', 'school'];
  const colorOptions = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const savedExpenseCategories = await AsyncStorage.getItem('expenseCategories');
      const savedIncomeCategories = await AsyncStorage.getItem('incomeCategories');
      
      if (savedExpenseCategories) {
        setCategories(JSON.parse(savedExpenseCategories));
      }
      
      if (savedIncomeCategories) {
        setIncomeCategories(JSON.parse(savedIncomeCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const saveNewCategory = async () => {
    if (!customCategoryName.trim() || !selectedIcon || !selectedColor) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newCategory = {
      id: Date.now().toString(),
      name: customCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor
    };

    try {
      if (activeTab === 'expense') {
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
      } else {
        const updatedCategories = [...incomeCategories, newCategory];
        setIncomeCategories(updatedCategories);
        await AsyncStorage.setItem('incomeCategories', JSON.stringify(updatedCategories));
      }

      setCustomCategoryName('');
      setSelectedIcon('');
      setSelectedColor('');
      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const removeCategory = async (categoryId) => {
    try {
      if (activeTab === 'expense') {
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        setCategories(updatedCategories);
        await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
      } else {
        const updatedCategories = incomeCategories.filter(cat => cat.id !== categoryId);
        setIncomeCategories(updatedCategories);
        await AsyncStorage.setItem('incomeCategories', JSON.stringify(updatedCategories));
      }
      Alert.alert('Success', 'Category removed successfully');
    } catch (error) {
      console.error('Error removing category:', error);
      Alert.alert('Error', 'Failed to remove category');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
            onPress={() => handleTabSwitch('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
              Expense Categories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'income' && styles.activeTab]}
            onPress={() => handleTabSwitch('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
              Income Categories
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.categoriesList}>
            {(activeTab === 'expense' ? categories : incomeCategories).map((category) => (
              <View key={category.id} style={styles.categoryTile}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCategory(category.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {showAddForm && (
            <View style={styles.addCategoryForm}>
              <Text style={styles.formTitle}>Add New Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Category Name"
                placeholderTextColor="#666666"
                value={customCategoryName}
                onChangeText={setCustomCategoryName}
              />

              <Text style={styles.formLabel}>Select Icon</Text>
              <View style={styles.iconsGrid}>
                {availableIcons.map((icon) => (
                  <TouchableOpacity
                    key={`icon-${icon}`}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.selectedIconOption
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon}
                      size={24}
                      color={selectedIcon === icon ? '#FFFFFF' : '#CCCCCC'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Select Color</Text>
              <View style={styles.colorsGrid}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={`color-${color}`}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveNewCategory}
              >
                <Text style={styles.saveButtonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#276EF1',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  categoriesList: {
    padding: 20,
  },
  categoryTile: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  addCategoryForm: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedIconOption: {
    backgroundColor: '#276EF1',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#276EF1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 8,
  },
});

export default CategoriesScreen; 