import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const TransactionsDetail = ({ 
  visible, 
  transaction, 
  categories, 
  paymentMethods,
  onClose, 
  onEdit, 
  onDelete, 
  onSave 
}) => {
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState(null);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setEditAmount(transaction.amount.toString());
      setEditDescription(transaction.title);
      setEditCategory(transaction.category);
      setEditPaymentMethod('Credit Card'); // Default or get from transaction if available
    }
  }, [transaction]);

  // Handle save edited transaction
  const handleSaveEdit = () => {
    const updatedTransaction = {
      ...transaction,
      amount: parseFloat(editAmount) || transaction.amount,
      title: editDescription || transaction.title,
      category: editCategory || transaction.category,
      icon: categories.find(cat => cat.name === editCategory)?.icon || transaction.icon,
      color: categories.find(cat => cat.name === editCategory)?.color || transaction.color,
    };
    
    onSave(updatedTransaction);
    setIsEditMode(false);
  };

  // Handle edit button press
  const handleEditPress = () => {
    setIsEditMode(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form to original values
    if (transaction) {
      setEditAmount(transaction.amount.toString());
      setEditDescription(transaction.title);
      setEditCategory(transaction.category);
      setEditPaymentMethod('Credit Card');
    }
    setIsEditMode(false);
  };

  // Create pan gesture for swiping down to close
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Если пользователь свайпает вниз больше чем на 50 единиц, закрываем модальное окно
      if (event.translationY > 50) {
        onClose();
      }
    });

  if (!transaction) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <GestureHandlerRootView style={{ flex: 1, position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.pullTabContainer}>
                <View style={styles.modalPullTab} />
              </View>
            </GestureDetector>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={true}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? 'Edit Transaction' : 'Transaction Details'}
                </Text>
                <TouchableOpacity onPress={isEditMode ? handleCancelEdit : onClose}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {!isEditMode ? (
                // View Transaction Details
                <View style={styles.transactionDetailsContent}>
                  <View style={[styles.transactionIcon, { backgroundColor: transaction.color }]}>
                    <Ionicons name={transaction.icon} size={24} color="#FFFFFF" />
                  </View>

                  <Text style={styles.transactionDetailsTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionDetailsCategory}>{transaction.category}</Text>

                  <Text style={styles.transactionDetailsAmount}>
                    -${transaction.amount.toFixed(2)}
                  </Text>

                  <View style={styles.transactionDetailsRow}>
                    <Text style={styles.transactionDetailsLabel}>Date</Text>
                    <Text style={styles.transactionDetailsValue}>{transaction.date}, 2023</Text>
                  </View>

                  <View style={styles.transactionDetailsRow}>
                    <Text style={styles.transactionDetailsLabel}>Time</Text>
                    <Text style={styles.transactionDetailsValue}>12:30 PM</Text>
                  </View>

                  <View style={styles.transactionDetailsRow}>
                    <Text style={styles.transactionDetailsLabel}>Transaction ID</Text>
                    <Text style={styles.transactionDetailsValue}>#TRX{transaction.id.toString().padStart(4, '0')}</Text>
                  </View>

                  <View style={styles.transactionDetailsRow}>
                    <Text style={styles.transactionDetailsLabel}>Payment Method</Text>
                    <View style={styles.transactionDetailsMethod}>
                      <View style={[styles.transactionMethodIcon, { backgroundColor: '#FF6384' }]}>
                        <Ionicons name="card" size={16} color="#FFFFFF" />
                      </View>
                      <Text style={styles.transactionDetailsValue}>Credit Card</Text>
                    </View>
                  </View>

                  <View style={styles.transactionDetailsRow}>
                    <Text style={styles.transactionDetailsLabel}>Status</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                      <Text style={[styles.transactionDetailsValue, { color: '#4CAF50' }]}>Completed</Text>
                    </View>
                  </View>

                  <View style={styles.transactionDetailsRow}>
                    <Text style={styles.transactionDetailsLabel}>Notes</Text>
                    <Text style={styles.transactionDetailsValue} numberOfLines={2}>
                      {transaction.title === 'Grocery Shopping' ? 'Weekly grocery run at Trader Joe\'s.' :
                       transaction.title === 'Uber Ride' ? 'Business trip to downtown meeting.' :
                       transaction.title === 'New Headphones' ? 'Sony WH-1000XM4 noise cancelling headphones.' :
                       'No notes available.'}
                    </Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.editTransactionButton}
                      onPress={handleEditPress}
                    >
                      <Text style={styles.editTransactionButtonText}>Edit Transaction</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteTransactionButton}
                      onPress={() => onDelete(transaction.id)}
                    >
                      <Text style={styles.deleteTransactionButtonText}>Delete Transaction</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Edit Transaction Form
                <View style={styles.editTransactionForm}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="$0.00"
                    placeholderTextColor="#666666"
                    keyboardType="decimal-pad"
                    value={editAmount}
                    onChangeText={setEditAmount}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    placeholderTextColor="#666666"
                    value={editDescription}
                    onChangeText={setEditDescription}
                  />

                  <Text style={styles.categoryLabel}>Select Category</Text>
                  <View style={styles.categoriesContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.name}
                        style={[
                          styles.categoryButton,
                          editCategory === category.name && { borderColor: category.color }
                        ]}
                        onPress={() => setEditCategory(category.name)}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                          <Ionicons name={category.icon} size={18} color="#FFFFFF" />
                        </View>
                        <Text style={styles.categoryText}>{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.categoryLabel}>Payment Method</Text>
                  <View style={styles.categoriesContainer}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.name}
                        style={[
                          styles.categoryButton,
                          editPaymentMethod === method.name && { borderColor: method.color }
                        ]}
                        onPress={() => setEditPaymentMethod(method.name)}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: method.color }]}>
                          <Ionicons name={method.icon} size={18} color="#FFFFFF" />
                        </View>
                        <Text style={styles.categoryText}>{method.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: '#FF6384' }]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  pullTabContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPullTab: {
    width: 60,
    height: 6,
    backgroundColor: '#444444',
    borderRadius: 3,
    opacity: 0,
  },
  modalScrollContent: {
    paddingBottom: 30,
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
  transactionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6384',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
    color: '#FF6384',
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
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  editTransactionButton: {
    backgroundColor: '#276EF1',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editTransactionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteTransactionButton: {
    backgroundColor: '#FF6384',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  deleteTransactionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Edit mode styles
  editTransactionForm: {
    paddingVertical: 10,
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
    minWidth: 100,
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
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default TransactionsDetail; 