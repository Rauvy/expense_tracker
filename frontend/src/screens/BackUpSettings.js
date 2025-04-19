import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Colors matching AddExpenseScreen
const COLORS = {
  EXPENSE: '#FF6384',
  INCOME: '#4BC0C0',
  TRANSPORT: '#36A2EB',
  SHOPPING: '#FFCE56',
  BILLS: '#4BC0C0',
  ENTERTAINMENT: '#9966FF',
  BLUE: '#D26A68'
};

const BackUpSettings = () => {
  const navigation = useNavigation();
  
  // States for date range selection
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // States for filter options
  const [transactionType, setTransactionType] = useState('all'); // 'all', 'income', 'expense'
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // States for authentication and download
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Categories lists (we'll load these from AsyncStorage)
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  
  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Load categories from AsyncStorage
  const loadCategories = async () => {
    try {
      const savedExpenseCategories = await AsyncStorage.getItem('expenseCategories');
      const savedIncomeCategories = await AsyncStorage.getItem('incomeCategories');
      
      const expCats = savedExpenseCategories 
        ? JSON.parse(savedExpenseCategories) 
        : [
            { name: 'Food', icon: 'fast-food', color: '#FF9500' },
            { name: 'Transport', icon: 'car', color: '#5856D6' },
            { name: 'Shopping', icon: 'cart', color: '#FF2D55' },
            { name: 'Bills', icon: 'receipt', color: '#4BC0C0' },
            { name: 'Entertainment', icon: 'film', color: '#FF3B30' },
            { name: 'Health', icon: 'medical', color: '#34C759' },
            { name: 'Education', icon: 'school', color: '#007AFF' },
            { name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
          ];
      
      const incCats = savedIncomeCategories 
        ? JSON.parse(savedIncomeCategories)
        : [
            { name: 'Salary', icon: 'cash', color: '#4CD964' },
            { name: 'Freelance', icon: 'laptop', color: '#007AFF' },
            { name: 'Investments', icon: 'trending-up', color: '#FFCC00' },
            { name: 'Gifts', icon: 'gift', color: '#FF2D55' },
          ];
      
      setExpenseCategories(expCats);
      setIncomeCategories(incCats);
      
      // Combine both with a type identifier
      const allCats = [
        ...expCats.map(cat => ({ ...cat, type: 'expense' })),
        ...incCats.map(cat => ({ ...cat, type: 'income' }))
      ];
      setAllCategories(allCats);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Could not load categories');
    }
  };
  
  // Handle date changes
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // Ensure end date is not before start date
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };
  
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      // Ensure end date is not before start date
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert('Invalid Date Range', 'End date cannot be before start date.');
      }
    }
  };
  
  // Handle transaction type selection
  const handleTransactionTypeSelect = (type) => {
    setTransactionType(type);
    
    // Reset selected categories when changing transaction type
    setSelectedCategories([]);
  };
  
  // Handle category selection
  const toggleCategorySelection = (category) => {
    const isSelected = selectedCategories.some(cat => cat.name === category.name && cat.type === category.type);
    
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(cat => 
        !(cat.name === category.name && cat.type === category.type)
      ));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Handle download request
  const handleDownloadRequest = () => {
    setPasswordModalVisible(true);
  };
  
  // Handle authentication
  const handleAuthenticate = async () => {
    setIsProcessingAuth(true);
    
    try {
      // In a real app, this would be an API call to validate the password
      // For now, we'll just simulate a successful authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsProcessingAuth(false);
      setPasswordModalVisible(false);
      setPassword('');
      
      // Show download modal and start download process
      startDownloadProcess();
    } catch (error) {
      setIsProcessingAuth(false);
      Alert.alert('Authentication Failed', 'Please check your password and try again.');
    }
  };
  
  // Start the download process
  const startDownloadProcess = () => {
    setDownloadModalVisible(true);
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev + 0.1;
        if (newProgress >= 1) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsDownloading(false);
            // Wait 1 second after completion before allowing dismissal
            setTimeout(() => {
              // Here you would handle the actual downloaded file
              Alert.alert(
                'Download Complete',
                'Your data has been downloaded successfully.',
                [{ text: 'OK', onPress: () => setDownloadModalVisible(false) }]
              );
            }, 1000);
          }, 500);
          return 1;
        }
        return newProgress;
      });
    }, 400);
  };
  
  // Format date for display - show in more compact format
  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate();
    const year = date.getFullYear();
    
    return `${day} ${month} ${dateNum} ${year}`;
  };
  
  // Format date in shorter format for highlighted date
  const formatShortDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[date.getMonth()];
    const dateNum = date.getDate();
    const year = date.getFullYear();
    
    return `${dateNum} ${month} ${year}`;
  };
  
  // Determine which categories to show based on selected transaction type
  const getFilterableCategories = () => {
    switch (transactionType) {
      case 'income':
        return incomeCategories.map(cat => ({ ...cat, type: 'income' }));
      case 'expense':
        return expenseCategories.map(cat => ({ ...cat, type: 'expense' }));
      default:
        return allCategories;
    }
  };

  // Render a filter button for transaction type selection
  const renderFilterButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        transactionType === value && styles.activeFilterButton,
        value === 'income' && transactionType === value && styles.activeIncomeButton,
        value === 'expense' && transactionType === value && styles.activeExpenseButton
      ]}
      onPress={() => handleTransactionTypeSelect(value)}
    >
      <Text
        style={[
          styles.filterText,
          transactionType === value && styles.activeFilterText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  // Render a category item for selection
  const renderCategoryItem = (category) => {
    const isSelected = selectedCategories.some(cat => 
      cat.name === category.name && cat.type === category.type
    );
    
    return (
      <TouchableOpacity 
        key={`${category.type}-${category.name}`}
        style={[styles.categoryItem, isSelected && { backgroundColor: category.color, borderColor: category.color }]}
        onPress={() => toggleCategorySelection(category)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: isSelected ? '#FFFFFF' : category.color }]}>
          <Ionicons 
            name={category.icon} 
            size={20} 
            color={isSelected ? category.color : '#FFFFFF'} 
          />
        </View>
        <Text style={[styles.categoryName, isSelected && styles.selectedCategoryText]}>
          {category.name}
        </Text>
        <View style={[styles.categoryTypeTag, isSelected && styles.selectedCategoryTypeTag]}>
          <Text style={[styles.categoryTypeText, isSelected && styles.selectedCategoryTypeText]}>
            {category.type === 'income' ? 'Income' : 'Expense'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Backup Settings</Text>
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date Range</Text>
            <View style={styles.dateLabelsContainer}>
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateLabel}>To</Text>
            </View>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                <Text style={styles.highlightedDate}>{formatShortDate(startDate)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                <Text style={styles.highlightedDate}>{formatShortDate(endDate)}</Text>
              </TouchableOpacity>
            </View>
            
            {showStartDatePicker && (
              <DateTimePicker
                testID="startDatePicker"
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                maximumDate={new Date()}
                textColor={COLORS.BLUE}
                accentColor={COLORS.BLUE}
              />
            )}
            
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
                maximumDate={new Date()}
                textColor={COLORS.BLUE}
                accentColor={COLORS.BLUE}
              />
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View style={styles.filterContainer}>
              {renderFilterButton('All', 'all')}
              {renderFilterButton('Income', 'income')}
              {renderFilterButton('Expenses', 'expense')}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Categories</Text>
            <Text style={styles.sectionSubtitle}>
              {selectedCategories.length === 0 
                ? 'All categories will be included' 
                : `${selectedCategories.length} categories selected`}
            </Text>
            
            <View style={styles.categoriesContainer}>
              {getFilterableCategories().map(category => renderCategoryItem(category))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadRequest}
          >
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Data</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Password Authentication Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Authentication Required</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPassword('');
                }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalText}>
              Please enter your password to download data.
            </Text>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888888" style={styles.inputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#888888"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                color="#FFFFFF"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.authButton, !password && styles.disabledButton]}
              onPress={handleAuthenticate}
              disabled={!password || isProcessingAuth}
            >
              {isProcessingAuth ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.authButtonText}>Authenticate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Download Progress Modal */}
      <Modal
        visible={downloadModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isDownloading ? 'Downloading Data' : 'Download Complete'}
              </Text>
              {!isDownloading && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setDownloadModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.modalText}>
              {isDownloading 
                ? 'Please wait while we prepare your data...' 
                : 'Your data has been downloaded successfully!'}
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${downloadProgress * 100}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.progressText}>
              {isDownloading 
                ? `${Math.round(downloadProgress * 100)}%` 
                : 'File saved to Downloads folder'}
            </Text>
            
            {!isDownloading && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setDownloadModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#121212',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  dateLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  highlightedDate: {
    color: COLORS.BLUE,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#252525',
    marginHorizontal: 5,
    borderRadius: 10,
  },
  activeFilterButton: {
    backgroundColor: COLORS.BLUE,
  },
  activeIncomeButton: {
    backgroundColor: COLORS.INCOME,
  },
  activeExpenseButton: {
    backgroundColor: COLORS.EXPENSE,
  },
  filterText: {
    color: '#888888',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    color: '#FFFFFF',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryTypeTag: {
    backgroundColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  selectedCategoryTypeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryTypeText: {
    fontSize: 11,
    color: '#888888',
  },
  selectedCategoryTypeText: {
    color: '#FFFFFF',
  },
  downloadButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    padding: 20,
    maxHeight: '60%',
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
  closeButton: {
    padding: 4,
  },
  modalText: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
  passwordInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
  },
  authButton: {
    width: '100%',
    backgroundColor: COLORS.BLUE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#252525',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.INCOME,
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    width: '100%',
    backgroundColor: COLORS.BLUE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BackUpSettings;
