import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CardBrands = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
  OTHER: 'credit-card'
};

const detectCardType = (cardNumber) => {
  const visaRegex = /^4/;
  const mastercardRegex = /^5[1-5]/;
  const amexRegex = /^3[47]/;
  const discoverRegex = /^6(?:011|5)/;
  
  if (visaRegex.test(cardNumber)) return CardBrands.VISA;
  if (mastercardRegex.test(cardNumber)) return CardBrands.MASTERCARD;
  if (amexRegex.test(cardNumber)) return CardBrands.AMEX;
  if (discoverRegex.test(cardNumber)) return CardBrands.DISCOVER;
  return CardBrands.OTHER;
};

const PaymentSettings = () => {
  const navigation = useNavigation();
  
  // Payment method states
  const [cards, setCards] = useState([]);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultCard, setDefaultCard] = useState(null);
  
  // New card form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState(CardBrands.OTHER);
  
  // Load saved cards
  useEffect(() => {
    const loadCards = async () => {
      try {
        const savedCards = await AsyncStorage.getItem('paymentCards');
        const savedDefaultCard = await AsyncStorage.getItem('defaultCard');
        
        if (savedCards) {
          setCards(JSON.parse(savedCards));
        }
        
        if (savedDefaultCard) {
          setDefaultCard(savedDefaultCard);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };
    
    loadCards();
  }, []);
  
  // Handle card number input with formatting
  const handleCardNumberChange = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    // Update card type based on the number
    setCardType(detectCardType(cleaned));
    
    // Limit to 16 digits (19 with spaces)
    if (cleaned.length <= 16) {
      setCardNumber(formatted);
    }
  };
  
  // Handle expiry date input with formatting (MM/YY)
  const handleExpiryChange = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/YY
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    
    // Limit to 4 digits (5 with slash)
    if (cleaned.length <= 4) {
      setExpiryDate(formatted);
    }
  };
  
  // Handle CVV input (3-4 digits)
  const handleCvvChange = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 3 or 4 digits (for Amex)
    if (cleaned.length <= (cardType === CardBrands.AMEX ? 4 : 3)) {
      setCvv(cleaned);
    }
  };
  
  // Get card icon based on type
  const getCardIcon = (type) => {
    switch (type) {
      case CardBrands.VISA:
        return <Ionicons name={CardBrands.VISA} size={24} color="#1A1F71" />;
      case CardBrands.MASTERCARD:
        return <Ionicons name={CardBrands.MASTERCARD} size={24} color="#EB001B" />;
      case CardBrands.AMEX:
        return <Ionicons name={CardBrands.AMEX} size={24} color="#006FCF" />;
      case CardBrands.DISCOVER:
        return <Ionicons name={CardBrands.DISCOVER} size={24} color="#FF6600" />;
      default:
        return <Ionicons name={CardBrands.OTHER} size={24} color="#666666" />;
    }
  };
  
  // Format card number to show only last 4 digits
  const formatCardNumberForDisplay = (number) => {
    if (!number) return '';
    
    // Remove spaces
    const cleaned = number.replace(/\s/g, '');
    
    // Show only last 4 digits
    return '•••• '.repeat(3) + cleaned.slice(-4);
  };
  
  // Add new card
  const handleAddCard = async () => {
    // Validate inputs
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length < 15) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV code');
      return;
    }
    
    // Check expiry date
    const [month, year] = expiryDate.split('/');
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt('20' + year, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (expiryMonth < 1 || expiryMonth > 12) {
      Alert.alert('Error', 'Please enter a valid month (01-12)');
      return;
    }
    
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      Alert.alert('Error', 'Card has expired');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate unique ID for the card
      const cardId = 'card_' + Date.now();
      
      // Create new card object
      const newCard = {
        id: cardId,
        name: cardName,
        number: cardNumber,
        expiry: expiryDate,
        type: cardType,
        lastFour: cardNumber.replace(/\s/g, '').slice(-4)
      };
      
      // Add to cards array
      const updatedCards = [...cards, newCard];
      setCards(updatedCards);
      
      // Set as default if it's the first card
      if (updatedCards.length === 1) {
        setDefaultCard(cardId);
        await AsyncStorage.setItem('defaultCard', cardId);
      }
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('paymentCards', JSON.stringify(updatedCards));
      
      // Reset form and close modal
      setCardName('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardType(CardBrands.OTHER);
      setAddCardVisible(false);
      
      Alert.alert('Success', 'Card added successfully');
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to add card');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set card as default
  const setAsDefault = async (cardId) => {
    try {
      setDefaultCard(cardId);
      await AsyncStorage.setItem('defaultCard', cardId);
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Error setting default card:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };
  
  // Delete card
  const deleteCard = async (cardId) => {
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
              const updatedCards = cards.filter(card => card.id !== cardId);
              setCards(updatedCards);
              
              // Update default card if needed
              if (defaultCard === cardId) {
                const newDefault = updatedCards.length > 0 ? updatedCards[0].id : null;
                setDefaultCard(newDefault);
                await AsyncStorage.setItem('defaultCard', newDefault || '');
              }
              
              // Save to AsyncStorage
              await AsyncStorage.setItem('paymentCards', JSON.stringify(updatedCards));
              
              Alert.alert('Success', 'Payment method deleted');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          }
        }
      ]
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
        
        <Text style={styles.screenTitle}>Payment Methods</Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddCardVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {cards.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="card-outline" size={80} color="#333333" />
            <Text style={styles.emptyStateText}>No payment methods added yet</Text>
            <TouchableOpacity 
              style={styles.addCardButton}
              onPress={() => setAddCardVisible(true)}
            >
              <Text style={styles.addCardButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {cards.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardItemHeader}>
                  {getCardIcon(card.type)}
                  {defaultCard === card.id && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.cardNumber}>
                  {formatCardNumberForDisplay(card.number)}
                </Text>
                
                <View style={styles.cardItemFooter}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <Text style={styles.cardExpiry}>Exp: {card.expiry}</Text>
                </View>
                
                <View style={styles.cardActions}>
                  {defaultCard !== card.id && (
                    <TouchableOpacity 
                      style={styles.cardAction}
                      onPress={() => setAsDefault(card.id)}
                    >
                      <Ionicons name="star-outline" size={18} color="#D26A68" />
                      <Text style={styles.cardActionText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.cardAction, styles.deleteAction]}
                    onPress={() => deleteCard(card.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Add Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addCardVisible}
        onRequestClose={() => setAddCardVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setAddCardVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.cardPreview}>
                <View style={styles.cardPreviewHeader}>
                  {getCardIcon(cardType)}
                </View>
                
                <Text style={styles.cardPreviewNumber}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
                
                <View style={styles.cardPreviewFooter}>
                  <View>
                    <Text style={styles.cardPreviewLabel}>CARDHOLDER NAME</Text>
                    <Text style={styles.cardPreviewValue}>
                      {cardName || 'YOUR NAME'}
                    </Text>
                  </View>
                  
                  <View>
                    <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                    <Text style={styles.cardPreviewValue}>
                      {expiryDate || 'MM/YY'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Enter cardholder name"
                  placeholderTextColor="#666666"
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Card Number</Text>
                <View style={styles.cardNumberInputContainer}>
                  <TextInput
                    style={styles.cardNumberInput}
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    maxLength={19} // 16 digits + 3 spaces
                  />
                  <View style={styles.cardTypeIcon}>
                    {getCardIcon(cardType)}
                  </View>
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.formLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.formInput}
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    placeholder="MM/YY"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    maxLength={5} // MM/YY
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>CVV</Text>
                  <TextInput
                    style={styles.formInput}
                    value={cvv}
                    onChangeText={handleCvvChange}
                    placeholder={cardType === CardBrands.AMEX ? "4 digits" : "3 digits"}
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    maxLength={cardType === CardBrands.AMEX ? 4 : 3}
                    secureTextEntry={true}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.addCardSubmitButton,
                  isLoading && styles.disabledButton
                ]}
                onPress={handleAddCard}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addCardSubmitButtonText}>Add Card</Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.securityNote}>
                <Ionicons name="lock-closed" size={14} color="#666666" /> Your card details are secure and encrypted
              </Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  addCardButton: {
    backgroundColor: '#D26A68',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  addCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardsContainer: {
    marginBottom: 20,
  },
  cardItem: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  defaultBadge: {
    backgroundColor: '#D26A68',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 15,
  },
  cardItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  cardExpiry: {
    color: '#999999',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  cardActionText: {
    color: '#D26A68',
    fontSize: 14,
    marginLeft: 5,
  },
  deleteAction: {
    marginLeft: 'auto',
  },
  deleteActionText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 5,
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
  cardPreview: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  cardPreviewHeader: {
    alignItems: 'flex-end',
  },
  cardPreviewNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 2,
    alignSelf: 'center',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    color: '#999999',
    fontSize: 10,
  },
  cardPreviewValue: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  cardNumberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  cardNumberInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  cardTypeIcon: {
    paddingLeft: 10,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addCardSubmitButton: {
    backgroundColor: '#D26A68',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addCardSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  securityNote: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
});

export default PaymentSettings;
