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

const initialIncomeCategories = [
  { id: '1', name: 'Salary', icon: 'cash', color: '#4BC0C0' },
  { id: '2', name: 'Freelance', icon: 'laptop', color: '#36A2EB' },
  { id: '3', name: 'Investments', icon: 'trending-up', color: '#FFCE56' },
  { id: '4', name: 'Gifts', icon: 'gift', color: '#9966FF' },
  { id: '5', name: 'Other', icon: 'add-circle', color: '#FF9F40' },
];

const availableIcons = [
  'cash', 'wallet', 'card', 'calculator', 'cash-outline', 'wallet-outline',
  'laptop', 'desktop', 'phone-portrait', 'tablet-portrait', 'newspaper',
  'trending-up', 'stats-chart', 'analytics', 'bar-chart', 'pie-chart',
  'gift', 'gift-outline', 'basket', 'cart', 'pricetag', 'pricetags',
  'business', 'briefcase', 'briefcase-outline', 'storefront', 'storefront-outline',
  'home', 'home-outline', 'bed', 'building', 'cube', 'cube-outline',
  'people', 'person', 'people-outline', 'person-outline', 'person-add',
  'car', 'airplane', 'boat', 'bus', 'train', 'bicycle',
  'add-circle', 'add-circle-outline', 'remove-circle', 'remove-circle-outline'
];

const colorOptions = [
  '#4BC0C0', '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40', 
  '#FF6384', '#FF6B6B', '#C9CB3F', '#4FFBDF', '#975FFF',
  '#E85D75', '#5DA5E8', '#F9F871', '#00B8A9', '#F08A5D',
  '#B83B5E', '#6A2C70', '#08D9D6', '#FF2E63', '#252A34'
];

const IncomeSource = () => {
  const navigation = useNavigation();
  
  // Income sources states
  const [incomeSources, setIncomeSources] = useState(initialIncomeCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [addSourceVisible, setAddSourceVisible] = useState(false);
  
  // New income source states
  const [newSourceName, setNewSourceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Load income sources from storage
  useEffect(() => {
    const loadIncomeSources = async () => {
      try {
        const savedSources = await AsyncStorage.getItem('incomeCategories');
        
        if (savedSources) {
          setIncomeSources(JSON.parse(savedSources));
        } else {
          // If no saved sources, save the initial ones
          await AsyncStorage.setItem('incomeCategories', JSON.stringify(initialIncomeCategories));
        }
      } catch (error) {
        console.error('Error loading income sources:', error);
      }
    };
    
    loadIncomeSources();
  }, []);
  
  // Filter income sources based on search query
  const filteredSources = incomeSources.filter(source => 
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Prepare data with add button as last item
  const dataWithAddButton = searchQuery ? filteredSources : [...filteredSources, { id: 'add-button', isAddButton: true }];
  
  // Reset new source form
  const resetNewSourceForm = () => {
    setNewSourceName('');
    setSelectedIcon('');
    setSelectedColor('');
  };
  
  // Open add source modal
  const openAddSourceModal = () => {
    resetNewSourceForm();
    setAddSourceVisible(true);
  };
  
  // Add new income source
  const handleAddSource = async () => {
    // Validate inputs
    if (!newSourceName.trim()) {
      Alert.alert('Error', 'Please enter a source name');
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
    
    // Check if source name already exists
    const sourceExists = incomeSources.some(
      source => source.name.toLowerCase() === newSourceName.toLowerCase()
    );
    
    if (sourceExists) {
      Alert.alert('Error', 'An income source with this name already exists');
      return;
    }
    
    // Create new income source
    const newSource = {
      id: Date.now().toString(),
      name: newSourceName.trim(),
      icon: selectedIcon,
      color: selectedColor
    };
    
    // Add to income sources
    const updatedSources = [...incomeSources, newSource];
    setIncomeSources(updatedSources);
    
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('incomeCategories', JSON.stringify(updatedSources));
      
      // Close modal and reset form
      setAddSourceVisible(false);
      resetNewSourceForm();
      
      Alert.alert('Success', 'Income source added successfully');
    } catch (error) {
      console.error('Error saving income source:', error);
      Alert.alert('Error', 'Failed to save income source');
    }
  };
  
  // Delete income source
  const handleDeleteSource = (sourceId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this income source?',
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
              // Find the source to be deleted
              const sourceToDelete = incomeSources.find(source => source.id === sourceId);
              if (!sourceToDelete) return;
              
              // Make sure we're not deleting the last remaining source
              if (incomeSources.length <= 1) {
                Alert.alert('Error', 'Cannot delete the last income source. At least one source must remain.');
                return;
              }
              
              // Filter out the source with the specified ID
              const updatedSources = incomeSources.filter(source => source.id !== sourceId);
              
              // First update the state
              setIncomeSources(updatedSources);
              
              // Then save to AsyncStorage
              await AsyncStorage.setItem('incomeCategories', JSON.stringify(updatedSources));
              
              // Show success alert after a small delay to ensure state is updated
              setTimeout(() => {
                Alert.alert('Success', `Income source "${sourceToDelete.name}" deleted successfully`);
              }, 100);
            } catch (error) {
              console.error('Error deleting income source:', error);
              Alert.alert('Error', 'Failed to delete income source');
            }
          }
        }
      ]
    );
  };
  
  // Render income source item
  const renderSourceItem = ({ item }) => {
    // Special case for add button
    if (item.isAddButton) {
      return (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddSourceModal}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Income</Text>
        </TouchableOpacity>
      );
    }
    
    // Normal income source item
    return (
      <View style={styles.sourceItem}>
        <View style={styles.sourceInfo}>
          <View style={[styles.sourceIcon, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.sourceName}>{item.name}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSource(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

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
        
        <Text style={styles.screenTitle}>Income Sources</Text>
        
        <View style={{width: 40}} />
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search income sources"
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
      
      {filteredSources.length === 0 && !searchQuery ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#333333" />
          <Text style={styles.emptyText}>
            No income sources added yet
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddSourceModal}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Income</Text>
          </TouchableOpacity>
        </View>
      ) : filteredSources.length === 0 && searchQuery ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#333333" />
          <Text style={styles.emptyText}>
            No income sources found for "{searchQuery}"
          </Text>
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dataWithAddButton}
          renderItem={renderSourceItem}
          keyExtractor={(item) => item.id || item.name}
          contentContainerStyle={styles.sourcesList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Add Income Source Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addSourceVisible}
        onRequestClose={() => setAddSourceVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Income Source</Text>
              <TouchableOpacity onPress={() => setAddSourceVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Source Preview */}
              <View style={styles.sourcePreview}>
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
                  {newSourceName || 'Income Source Name'}
                </Text>
              </View>
              
              {/* Source Name Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Source Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={newSourceName}
                  onChangeText={setNewSourceName}
                  placeholder="Enter source name"
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
                        selectedIcon === icon && styles.selectedIconOption,
                        selectedIcon === icon && selectedColor ? { backgroundColor: selectedColor } : {}
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
                style={[
                  styles.addSourceButton,
                  selectedColor ? { backgroundColor: selectedColor } : {}
                ]}
                onPress={handleAddSource}
              >
                <Text style={styles.addSourceButtonText}>Add Income Source</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bdc3c7',
    borderRadius: 8,
    backgroundColor: 'rgba(189, 195, 199, 0.1)',
  },
  addButtonText: {
    color: '#bdc3c7',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
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
  sourcesList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sourceName: {
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
  sourcePreview: {
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
  addSourceButton: {
    backgroundColor: '#276EF1',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addSourceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IncomeSource;
