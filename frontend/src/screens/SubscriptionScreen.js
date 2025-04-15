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

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  
  // Subscription states
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  
  // Card form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('credit-card');

  const subscriptionPlans = {
    monthly: {
      price: '$9.99',
      period: 'month',
      savings: '',
      features: [
        'Unlimited expense tracking',
        'Custom categories',
        'Budget planning',
        'Basic reports',
        'Email support'
      ]
    },
    yearly: {
      price: '$99.99',
      period: 'year',
      savings: 'Save 16%',
      features: [
        'Everything in Monthly plan',
        'Advanced analytics',
        'Priority support',
        'Data export',
        'Custom reports'
      ]
    }
  };

  // Load subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const savedSubscription = await AsyncStorage.getItem('subscription');
        if (savedSubscription) {
          setSubscription(JSON.parse(savedSubscription));
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    };
    
    loadSubscription();
  }, []);
  
  // Handle card number input with formatting
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    if (cleaned.length <= 16) {
      setCardNumber(formatted);
    }
  };
  
  // Handle expiry date input with formatting (MM/YY)
  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length <= 4) {
      setExpiryDate(formatted);
    }
  };
  
  // Handle CVV input (3-4 digits)
  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };
  
  // Handle subscription update
  const handleUpdateSubscription = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call your backend API
      const newSubscription = {
        plan: 'Premium',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        price: '$9.99',
        billingCycle: 'monthly',
        cardLastFour: cardNumber.replace(/\s/g, '').slice(-4)
      };
      
      await AsyncStorage.setItem('subscription', JSON.stringify(newSubscription));
      setSubscription(newSubscription);
      setAddCardVisible(false);
      
      Alert.alert('Success', 'Subscription updated successfully');
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert('Error', 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel subscription
  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel'
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              const cancelledSubscription = {
                ...subscription,
                status: 'cancelled',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              };
              
              await AsyncStorage.setItem('subscription', JSON.stringify(cancelledSubscription));
              setSubscription(cancelledSubscription);
              
              Alert.alert('Success', 'Subscription cancelled successfully');
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
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
      </View>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {subscription ? (
          <View style={styles.subscriptionContainer}>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.planName}>{subscription.plan}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: subscription.status === 'active' ? '#27ae60' : '#e74c3c' }
                ]}>
                  <Text style={styles.statusText}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.subscriptionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>{subscription.price}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Billing Cycle</Text>
                  <Text style={styles.detailValue}>{subscription.billingCycle}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Next Billing Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>•••• {subscription.cardLastFour}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            
            <View style={styles.planToggle}>
              <TouchableOpacity 
                style={[
                  styles.toggleOption,
                  selectedPlan === 'monthly' && styles.toggleOptionActive
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={[
                  styles.toggleText,
                  selectedPlan === 'monthly' && styles.toggleTextActive
                ]}>Monthly</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.toggleOption,
                  selectedPlan === 'yearly' && styles.toggleOptionActive
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <Text style={[
                  styles.toggleText,
                  selectedPlan === 'yearly' && styles.toggleTextActive
                ]}>Yearly</Text>
                {subscriptionPlans.yearly.savings && (
                  <Text style={styles.savingsBadge}>{subscriptionPlans.yearly.savings}</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planPrice}>{subscriptionPlans[selectedPlan].price}</Text>
                <Text style={styles.planPeriod}>per {subscriptionPlans[selectedPlan].period}</Text>
              </View>
              
              <View style={styles.featuresList}>
                {subscriptionPlans[selectedPlan].features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.subscribeButton}
                onPress={() => setAddCardVisible(true)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By subscribing, you agree to our Terms of Service and Privacy Policy. 
                Your subscription will automatically renew at the end of each billing period. 
                You can cancel anytime.
              </Text>
            </View>
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
              <Text style={styles.modalTitle}>Update Payment Method</Text>
              <TouchableOpacity onPress={() => setAddCardVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.cardPreview}>
                <View style={styles.cardPreviewHeader}>
                  <Ionicons name={cardType} size={24} color="#FFFFFF" />
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
                    maxLength={19}
                  />
                  <View style={styles.cardTypeIcon}>
                    <Ionicons name={cardType} size={24} color="#FFFFFF" />
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
                    maxLength={5}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>CVV</Text>
                  <TextInput
                    style={styles.formInput}
                    value={cvv}
                    onChangeText={handleCvvChange}
                    placeholder="3 digits"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry={true}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.addCardSubmitButton,
                  isLoading && styles.disabledButton
                ]}
                onPress={handleUpdateSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addCardSubmitButtonText}>Update Payment Method</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  subscriptionContainer: {
    marginBottom: 20,
  },
  subscriptionCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#999999',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#276EF1',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  addCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#276EF1',
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
  plansContainer: {
    padding: 15,
  },
  plansTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleOptionActive: {
    backgroundColor: '#333333',
  },
  toggleText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#27ae60',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: '#276EF1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    padding: 15,
    backgroundColor: '#252525',
    borderRadius: 12,
  },
  termsText: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default SubscriptionScreen; 