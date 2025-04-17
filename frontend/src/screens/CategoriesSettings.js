import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const initialCategories = [
  { id: '1', name: 'Food', icon: 'fast-food', color: '#FF6384' },
  { id: '2', name: 'Transport', icon: 'car', color: '#36A2EB' },
  { id: '3', name: 'Shopping', icon: 'cart', color: '#FFCE56' },
  { id: '4', name: 'Bills', icon: 'flash', color: '#4BC0C0' },
  { id: '5', name: 'Entertainment', icon: 'film', color: '#9966FF' },
];

const availableIcons = [
  'fast-food', 'restaurant', 'cafe', 'pizza', 'beer', 'wine',
  'car', 'bus', 'train', 'airplane', 'boat', 'bicycle',
  'cart', 'basket', 'gift', 'bag', 'pricetag', 'shirt',
  'flash', 'home', 'tv', 'wifi', 'call', 'desktop',
  'film', 'game-controller', 'musical-notes', 'headset', 'fitness',
  'medkit', 'heart', 'pulse', 'bandage', 'fitness-outline',
  'book', 'school', 'library', 'briefcase', 'cash', 'card',
  'hammer', 'build', 'construct', 'brush', 'color-palette',
  'flower', 'leaf', 'paw', 'nutrition', 'basketball', 'football'
];

const colorOptions = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6B6B', '#C9CB3F', '#4FFBDF', '#975FFF',
  '#E85D75', '#5DA5E8', '#F9F871', '#00B8A9', '#F08A5D',
  '#B83B5E', '#6A2C70', '#08D9D6', '#FF2E63', '#252A34'
];

const CategoriesSettings = () => {
  const navigation = useNavigation();

  // Categories states
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);

  // New category states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Load categories from storage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem('expenseCategories');

        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          // If no saved categories, save the initial ones
          await AsyncStorage.setItem('expenseCategories', JSON.stringify(initialCategories));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset new category form
  const resetNewCategoryForm = () => {
    setNewCategoryName('');
    setSelectedIcon('');
    setSelectedColor('');
  };

  // Open add category modal
  const openAddCategoryModal = () => {
    resetNewCategoryForm();
    setAddCategoryVisible(true);
  };

  // Add new category
  const handleAddCategory = async () => {
    // Validate inputs
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!selectedIcon) {
      Alert.alert('Error', 'Please select an icon');
      return;
    }

    if (!selectedColor) {
      Alert.alert('Error', 'Please select a color');
      return;
    }

    // Check if category name already exists
    const categoryExists = categories.some(
      category => category.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (categoryExists) {
      Alert.alert('Error', 'A category with this name already exists');
      return;
    }

    // Create new category
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor
    };

    // Add to categories
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));

      // Close modal and reset form
      setAddCategoryVisible(false);
      resetNewCategoryForm();

      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this category?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find the category to be deleted
              const categoryToDelete = categories.find(cat => cat.id === categoryId);
              if (!categoryToDelete) return;

              // Make sure we're not deleting the last remaining category
              if (categories.length <= 1) {
                Alert.alert('Error', 'Cannot delete the last category. At least one category must remain.');
                return;
              }

              // Filter out the category with the specified ID
              const updatedCategories = categories.filter(category => category.id !== categoryId);
              setCategories(updatedCategories);

              // Save updated categories to AsyncStorage
              await AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));

              Alert.alert('Success', `Category "${categoryToDelete.name}" deleted successfully`);
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCategory(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Categories</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddCategoryModal}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search categories"
          placeholderTextColor="#666666"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      {filteredCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#333333" />
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No categories found for "${searchQuery}"`
              : 'No categories added yet'}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addCategoryVisible}
        onRequestClose={() => setAddCategoryVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setAddCategoryVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Preview */}
              <View style={styles.categoryPreview}>
                <View style={[
                  styles.previewIcon,
                  { backgroundColor: selectedColor || '#333333' }
                ]}>
                  {selectedIcon ? (
                    <Ionicons name={selectedIcon} size={30} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="help-outline" size={30} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.previewName}>
                  {newCategoryName || 'Category Name'}
                </Text>
              </View>

              {/* Category Name Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Enter category name"
                  placeholderTextColor="#666666"
                />
              </View>

              {/* Icon Selection */}
              <View style={styles.formGroup}>
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
              </View>

              {/* Color Selection */}
              <View style={styles.formGroup}>
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
              </View>

              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.addCategoryButtonText}>Add Category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  clearSearchButton: {
    paddingVertical: 10,
  },
  clearSearchText: {
    color: '#276EF1',
    fontSize: 16,
  },
  categoriesList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  categoryInfo: {
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
    marginRight: 15,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  categoryPreview: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#252525',
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
  addCategoryButton: {
    backgroundColor: '#276EF1',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addCategoryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CategoriesSettings;
