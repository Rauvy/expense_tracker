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

const initialPaymentMethods = [
  { id: '1', name: 'Cash', icon: 'cash', color: '#4BC0C0' },
  { id: '2', name: 'Credit Card', icon: 'card', color: '#FF6384' },
  { id: '3', name: 'Debit Card', icon: 'card-outline', color: '#36A2EB' },
  { id: '4', name: 'Bank Transfer', icon: 'business', color: '#FFCE56' },
  { id: '5', name: 'Mobile Payment', icon: 'phone-portrait', color: '#9966FF' },
];

const availableIcons = [
  'cash', 'card', 'card-outline', 'wallet', 'wallet-outline',
  'business', 'briefcase', 'phone-portrait', 'smartphone',
  'logo-paypal', 'logo-apple', 'logo-google', 'logo-amazon',
  'phone-portrait-outline', 'cash-outline', 'wallet-outline',
  'globe-outline', 'at-outline', 'git-branch-outline', 'link',
  'qr-code', 'barcode', 'gift', 'gift-outline', 'pricetag',
  'cafe', 'beer', 'restaurant', 'fast-food', 'basket',
  'cart', 'bag', 'bag-handle', 'card', 'wallet', 'cash'
];

const colorOptions = [
  '#E57373', // dark pastel red
  '#4DB6AC', // muted teal
  '#64B5F6', // medium soft blue
  '#81C784', // soft green
  '#F48FB1', // dusty pink
  '#A1887F', // warm taupe
  '#BA68C8', // muted lavender
  '#F06292', // medium rose
  '#7986CB', // faded indigo
  '#9575CD', // medium violet
  '#FF8A65', // pastel orange
  '#4DD0E1', // darker aqua
  '#4FC3F7', // ocean blue
  '#FF8C94', // richer light red
  '#FFD54F', // strong pastel yellow
  '#AED581', // olive pastel
  '#B39DDB', // gentle purple
  '#A5D6A7', // medium mint
  '#CE93D8'  // rich soft purple
];

const PaymentMethods = () => {
  const navigation = useNavigation();

  // Payment methods states
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [searchQuery, setSearchQuery] = useState('');
  const [addMethodVisible, setAddMethodVisible] = useState(false);

  // New payment method states
  const [newMethodName, setNewMethodName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Load payment methods from storage
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const savedMethods = await AsyncStorage.getItem('paymentMethods');

        if (savedMethods) {
          setPaymentMethods(JSON.parse(savedMethods));
        } else {
          // If no saved methods, save the initial ones
          await AsyncStorage.setItem('paymentMethods', JSON.stringify(initialPaymentMethods));
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };

    loadPaymentMethods();
  }, []);

  // Filter payment methods based on search query
  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset new payment method form
  const resetNewMethodForm = () => {
    setNewMethodName('');
    setSelectedIcon('');
    setSelectedColor('');
  };

  // Open add payment method modal
  const openAddMethodModal = () => {
    resetNewMethodForm();
    setAddMethodVisible(true);
  };

  // Add new payment method
  const handleAddMethod = async () => {
    // Validate inputs
    if (!newMethodName.trim()) {
      Alert.alert('Error', 'Please enter a payment method name');
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

    // Check if method name already exists
    const methodExists = paymentMethods.some(
      method => method.name.toLowerCase() === newMethodName.toLowerCase()
    );

    if (methodExists) {
      Alert.alert('Error', 'A payment method with this name already exists');
      return;
    }

    // Create new payment method
    const newMethod = {
      id: Date.now().toString(),
      name: newMethodName.trim(),
      icon: selectedIcon,
      color: selectedColor
    };

    // Add to payment methods
    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));

      // Close modal and reset form
      setAddMethodVisible(false);
      resetNewMethodForm();

      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  // Delete payment method
  const handleDeleteMethod = (methodId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this payment method?',
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
              // Find the method to be deleted
              const methodToDelete = paymentMethods.find(method => method.id === methodId);
              if (!methodToDelete) return;

              // Make sure we're not deleting the last remaining method
              if (paymentMethods.length <= 1) {
                Alert.alert('Error', 'Cannot delete the last payment method. At least one method must remain.');
                return;
              }

              // Filter out the method with the specified ID
              const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
              setPaymentMethods(updatedMethods);

              // Save updated methods to AsyncStorage
              await AsyncStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));

              Alert.alert('Success', `Payment method "${methodToDelete.name}" deleted successfully`);
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          }
        }
      ]
    );
  };

  // Render payment method item
  const renderMethodItem = ({ item }) => (
    <View style={styles.methodItem}>
      <View style={styles.methodInfo}>
        <View style={[styles.methodIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.methodName}>{item.name}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMethod(item.id)}
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

        <Text style={styles.screenTitle}>Payment Methods</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddMethodModal}
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
          placeholder="Search payment methods"
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

      {filteredMethods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#333333" />
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No payment methods found for "${searchQuery}"`
              : 'No payment methods added yet'}
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
          data={filteredMethods}
          renderItem={renderMethodItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.methodsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addMethodVisible}
        onRequestClose={() => setAddMethodVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setAddMethodVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Method Preview */}
              <View style={styles.methodPreview}>
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
                  {newMethodName || 'Payment Method Name'}
                </Text>
              </View>

              {/* Method Name Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Method Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMethodName}
                  onChangeText={setNewMethodName}
                  placeholder="Enter payment method name"
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
                        selectedIcon === icon && { backgroundColor: selectedColor || '#D26A68' }
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
                  styles.addMethodButton,
                  { backgroundColor: selectedColor || '#D26A68' }
                ]}
                onPress={handleAddMethod}
              >
                <Text style={styles.addMethodButtonText}>Add Payment Method</Text>
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
    backgroundColor: '#D26A68',
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
    color: '#D26A68',
    fontSize: 16,
  },
  methodsList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodName: {
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
  methodPreview: {
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
  addMethodButton: {
    backgroundColor: '#D26A68',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addMethodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentMethods;
