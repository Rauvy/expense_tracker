import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoriesScreen = ({ navigation }) => {
  const [expenseCategories, setExpenseCategories] = useState([
    { id: '1', name: 'Food & Dining', icon: 'fast-food', color: '#FF9500' },
    { id: '2', name: 'Shopping', icon: 'cart', color: '#5856D6' },
    { id: '3', name: 'Transportation', icon: 'car', color: '#FF2D55' },
    { id: '4', name: 'Entertainment', icon: 'game-controller', color: '#4CD964' },
    { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: '#007AFF' },
    { id: '6', name: 'Health & Fitness', icon: 'fitness', color: '#FF9500' },
    { id: '7', name: 'Education', icon: 'school', color: '#5AC8FA' },
    { id: '8', name: 'Travel', icon: 'airplane', color: '#5856D6' },
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
      
      if (savedExpenseCategories) {
        setExpenseCategories(JSON.parse(savedExpenseCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
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
      const updatedCategories = [...expenseCategories, newCategory];
      setExpenseCategories(updatedCategories);
      await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));

      setCustomCategoryName('');
      setSelectedIcon('');
      setSelectedColor('');
      setShowAddForm(false);
      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const removeCategory = async (categoryId) => {
    try {
      const updatedCategories = expenseCategories.filter(cat => cat.id !== categoryId);
      setExpenseCategories(updatedCategories);
      await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
      
      setTimeout(() => {
        Alert.alert('Success', 'Category removed successfully');
      }, 100);
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
        <Text style={styles.headerTitle}>Expense Categories</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.categoriesList}>
            {expenseCategories.map((category) => (
              <View key={category.id} style={styles.categoryTile}>
                <View style={styles.categoryContent}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeCategory(category.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginLeft: 12,
  },
});

export default CategoriesScreen; 