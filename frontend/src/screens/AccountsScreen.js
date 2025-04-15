import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const AccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([
    {
      id: '1',
      type: 'bank',
      name: 'Chase Checking',
      number: '••••4567',
      balance: 3245.78,
      income: 4500.00,
      expenses: 1254.22,
      isDefault: false,
      iconName: 'business',
      connected: true,
      lastSync: '2 hours ago'
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa Credit',
      number: '••••8910',
      balance: 1500.00,
      income: 0.00,
      expenses: 500.00,
      isDefault: false,
      iconName: 'card',
      connected: true,
      lastSync: '3 hours ago'
    },
    {
      id: '3',
      type: 'bank',
      name: 'Bank of America Savings',
      number: '••••2345',
      balance: 12500.50,
      income: 0.00,
      expenses: 0.00,
      isDefault: false,
      iconName: 'business',
      connected: true,
      lastSync: '1 day ago'
    },
    {
      id: '4',
      type: 'paypal',
      name: 'PayPal',
      email: 'j•••@gmail.com',
      balance: 350.75,
      income: 200.00,
      expenses: 150.00,
      isDefault: false,
      iconName: 'logo-paypal',
      connected: true,
      lastSync: '5 hours ago'
    },
    {
      id: '5',
      type: 'crypto',
      name: 'Coinbase',
      address: '••••••XZ45',
      balance: 650.20,
      income: 0.00,
      expenses: 0.00,
      isDefault: false,
      iconName: 'logo-bitcoin',
      connected: true,
      lastSync: '1 day ago'
    },
  ]);

  const [newAccountVisible, setNewAccountVisible] = useState(false);
  const [accountType, setAccountType] = useState('bank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState('1M');
  const [selectedTopButton, setSelectedTopButton] = useState('netWorth');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [expandedTile, setExpandedTile] = useState(null);

  // Calculate net worth and change
  const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
  const previousMonthNetWorth = netWorth * 0.95; // Simulating 5% growth for demo
  const netWorthChange = ((netWorth - previousMonthNetWorth) / previousMonthNetWorth) * 100;

  const handleAccountPress = (account) => {
    setSelectedAccountId(account.id);
    setSubscriptionModalVisible(true);
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'bank':
        return 'business';
      case 'card':
        return 'card';
      case 'paypal':
        return 'logo-paypal';
      case 'crypto':
        return 'logo-bitcoin';
      default:
        return 'wallet';
    }
  };

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  const renderGraph = () => {
    // Define different datasets for each view
    const getGraphData = () => {
      switch (selectedTopButton) {
        case 'netWorth':
          return [120, 145, 128, 180, 199, 143, 160, 175, 190, 210, 195, 180, 165, 150];
        case 'cash':
          return [80, 95, 88, 120, 139, 103, 120, 135, 150, 170, 155, 140, 125, 110];
        case 'creditCards':
          return [40, 50, 40, 60, 60, 40, 40, 40, 40, 40, 40, 40, 40, 40];
        default:
          return [120, 145, 128, 180, 199, 143, 160, 175, 190, 210, 195, 180, 165, 150];
      }
    };

    const data = getGraphData();
    const currentValue = selectedIndex !== null ? data[selectedIndex] : data[data.length - 1];
    const previousValue = data[0];
    const growthPercentage = ((currentValue - previousValue) / previousValue) * 100;

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <View style={styles.graphContainer}>
        <View style={styles.graphInfoContainer}>
          <Text style={styles.graphValue}>${currentValue.toLocaleString()}</Text>
          <Text style={[styles.graphGrowth, { color: growthPercentage >= 0 ? '#27ae60' : '#e74c3c' }]}>
            {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(2)}%
          </Text>
          <Text style={styles.graphDate}>{currentDate}</Text>
        </View>
        <View style={styles.graphWrapper}>
          <LineChart
            data={{
              labels: [],
              datasets: [{
                data: data,
              }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#121212',
              backgroundGradientFrom: '#121212',
              backgroundGradientTo: '#121212',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(41, 128, 185, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 0,
              },
              propsForDots: {
                r: '0',
                strokeWidth: '0',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: 'transparent',
                strokeWidth: 0,
              },
              propsForLabels: {
                fontSize: 10,
              },
              propsForHorizontalLabels: {
                stroke: 'rgba(255, 255, 255, 0.3)',
                strokeWidth: 1,
                strokeDasharray: [5, 5],
                position: 'bottom',
              },
            }}
            bezier
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={false}
            withHorizontalLabels={false}
            withXLabels={false}
            withYLabels={false}
            style={{
              marginVertical: 0,
              borderRadius: 0,
              paddingRight: 0,
            }}
          />
          <View
            style={styles.touchArea}
            onTouchStart={(e) => {
              const touchX = e.nativeEvent.locationX;
              const index = Math.round((touchX / screenWidth) * (data.length - 1));
              setSelectedIndex(Math.max(0, Math.min(index, data.length - 1)));
            }}
            onTouchMove={(e) => {
              const touchX = e.nativeEvent.locationX;
              const index = Math.round((touchX / screenWidth) * (data.length - 1));
              setSelectedIndex(Math.max(0, Math.min(index, data.length - 1)));
            }}
            onTouchEnd={() => {
              setTimeout(() => setSelectedIndex(null), 1000);
            }}
          />
          {selectedIndex !== null && (
            <View style={[styles.verticalLine, { left: `${(selectedIndex / (data.length - 1)) * 100}%` }]} />
          )}
        </View>
      </View>
    );
  };

  const renderAccountTiles = () => {
    const cashAccounts = accounts.filter(account => account.type === 'bank' || account.type === 'cash');
    const creditCardAccounts = accounts.filter(account => account.type === 'card');

    const cashTotal = cashAccounts.reduce((sum, account) => sum + account.balance, 0);
    const creditCardTotal = creditCardAccounts.reduce((sum, account) => sum + account.balance, 0);
    const totalAssets = accounts.filter(account => account.balance > 0).reduce((sum, account) => sum + account.balance, 0);
    const totalLiabilities = Math.abs(accounts.filter(account => account.balance < 0).reduce((sum, account) => sum + account.balance, 0));

    // Calculate growth percentages (using mock data for now)
    const cashGrowth = 5.2; // Example growth percentage
    const creditCardGrowth = -2.8; // Example growth percentage

    // Calculate percentages with proper handling for zero values
    const cashPercentage = totalAssets > 0 ? ((cashTotal / totalAssets) * 100).toFixed(1) : '0.0';
    const creditCardPercentage = totalLiabilities > 0 ? ((creditCardTotal / totalLiabilities) * 100).toFixed(1) : '0.0';

    return (
      <View style={styles.accountTilesContainer}>
        <View>
          <TouchableOpacity
            style={[styles.accountTile, expandedTile === 'cash' && styles.accountTileActive]}
            onPress={() => setExpandedTile(expandedTile === 'cash' ? null : 'cash')}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileLeft}>
                <View style={styles.tileHeader}>
                  <Ionicons name="cash" size={20} color="#FFFFFF" />
                  <Text style={styles.tileTitle}>Cash</Text>
                </View>
                <View style={styles.tileInfo}>
                  <Text style={styles.tileSubtitle}>{cashAccounts.length} accounts</Text>
                  <Text style={[styles.tileGrowth, { color: cashGrowth >= 0 ? '#27ae60' : '#e74c3c' }]}>
                    {cashGrowth >= 0 ? '+' : ''}{cashGrowth}%
                  </Text>
                </View>
              </View>
              <View style={styles.tileRight}>
                <Text style={styles.tileAmount}>${cashTotal.toLocaleString()}</Text>
                <Text style={styles.tilePercentage}>{cashPercentage}% of assets</Text>
              </View>
            </View>
          </TouchableOpacity>
          {expandedTile === 'cash' && (
            <View style={styles.expandedAccounts}>
              {cashAccounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.expandedAccount}
                  onPress={() => handleAccountPress(account)}
                >
                  <View style={styles.expandedAccountLeft}>
                    <View style={styles.expandedAccountHeader}>
                      <Ionicons name={getAccountIcon(account.type)} size={20} color="#FFFFFF" />
                      <Text style={styles.expandedAccountName}>
                        {account.name} ({account.number.slice(-4)})
                      </Text>
                    </View>
                    <View style={styles.expandedAccountDetails}>
                      <Text style={styles.expandedAccountType}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.expandedAccountRight}>
                    <Text style={styles.expandedAccountBalance}>
                      ${Math.abs(account.balance).toLocaleString()}
                    </Text>
                    <Text style={styles.expandedAccountSync}>
                      {account.lastSync}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View>
          <TouchableOpacity
            style={[styles.accountTile, expandedTile === 'creditCards' && styles.accountTileActive]}
            onPress={() => setExpandedTile(expandedTile === 'creditCards' ? null : 'creditCards')}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileLeft}>
                <View style={styles.tileHeader}>
                  <Ionicons name="card" size={20} color="#FFFFFF" />
                  <Text style={styles.tileTitle}>Credit Cards</Text>
                </View>
                <View style={styles.tileInfo}>
                  <Text style={styles.tileSubtitle}>{creditCardAccounts.length} accounts</Text>
                  <Text style={[styles.tileGrowth, { color: creditCardGrowth >= 0 ? '#27ae60' : '#e74c3c' }]}>
                    {creditCardGrowth >= 0 ? '+' : ''}{creditCardGrowth}%
                  </Text>
                </View>
              </View>
              <View style={styles.tileRight}>
                <Text style={styles.tileAmount}>${creditCardTotal.toLocaleString()}</Text>
                <Text style={styles.tilePercentage}>{creditCardPercentage}% of liabilities</Text>
              </View>
            </View>
          </TouchableOpacity>
          {expandedTile === 'creditCards' && (
            <View style={styles.expandedAccounts}>
              {creditCardAccounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.expandedAccount}
                  onPress={() => handleAccountPress(account)}
                >
                  <View style={styles.expandedAccountLeft}>
                    <View style={styles.expandedAccountHeader}>
                      <Ionicons name={getAccountIcon(account.type)} size={20} color="#FFFFFF" />
                      <Text style={styles.expandedAccountName}>
                        {account.name} ({account.number.slice(-4)})
                      </Text>
                    </View>
                    <View style={styles.expandedAccountDetails}>
                      <Text style={styles.expandedAccountType}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.expandedAccountRight}>
                    <Text style={styles.expandedAccountBalance}>
                      ${Math.abs(account.balance).toLocaleString()}
                    </Text>
                    <Text style={styles.expandedAccountSync}>
                      {account.lastSync}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <Ionicons name="add" size={20} color="#bdc3c7" />
          <Text style={styles.addAccountButtonText}>Add Account</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAccountCard = (account) => (
    <View
      key={account.id}
      style={styles.accountCard}
    >
      <View style={styles.accountCardHeader}>
        <View style={styles.accountIconContainer}>
          <Ionicons
            name={account.type === 'bank' ? 'business' :
                 account.type === 'card' ? 'card' :
                 account.type === 'paypal' ? 'logo-paypal' : 'logo-bitcoin'}
            size={22}
            color="#FFFFFF"
          />
        </View>
        <View>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountNumber}>
            {account.type === 'paypal' ? account.email :
             account.type === 'crypto' ? account.address : account.number}
          </Text>
          <View style={styles.connectionInfo}>
            <View style={[styles.connectionDot, { backgroundColor: account.connected ? '#4CAF50' : '#FF3B30' }]} />
            <Text style={styles.lastSyncText}>
              {account.connected ? `Last sync: ${account.lastSync}` : 'Disconnected'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.accountBalanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>${account.balance.toFixed(2)}</Text>
      </View>

      <View style={styles.accountActions}>
        <TouchableOpacity
          style={[styles.accountAction, styles.syncAction]}
          onPress={() => {
            Alert.alert('Sync', `Syncing ${account.name}...`);
            // In a real app, this would trigger a sync with the financial institution
          }}
        >
          <Ionicons name="sync" size={16} color="#FFFFFF" />
          <Text style={styles.accountActionText}>Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountAction, styles.editAction]}
          onPress={() => {
            Alert.alert('Edit Account', `Edit ${account.name} details`);
          }}
        >
          <Ionicons name="create" size={16} color="#FFFFFF" />
          <Text style={styles.accountActionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountAction, styles.deleteAction]}
          onPress={() => {
            Alert.alert(
              'Disconnect Account',
              `Are you sure you want to disconnect ${account.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Disconnect',
                  style: 'destructive',
                  onPress: () => {
                    setAccounts(accounts.filter(a => a.id !== account.id));
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="close-circle" size={16} color="#FFFFFF" />
          <Text style={styles.accountActionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNewAccountModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={newAccountVisible}
      onRequestClose={() => setNewAccountVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Connect New Account</Text>
            <TouchableOpacity onPress={() => setNewAccountVisible(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.accountTypeSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.accountTypeOption,
                  accountType === 'bank' && styles.accountTypeSelected
                ]}
                onPress={() => setAccountType('bank')}
              >
                <Ionicons
                  name="business"
                  size={22}
                  color={accountType === 'bank' ? "#276EF1" : "#FFFFFF"}
                />
                <Text style={[
                  styles.accountTypeText,
                  accountType === 'bank' && styles.accountTypeTextSelected
                ]}>
                  Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.accountTypeOption,
                  accountType === 'card' && styles.accountTypeSelected
                ]}
                onPress={() => setAccountType('card')}
              >
                <Ionicons
                  name="card"
                  size={22}
                  color={accountType === 'card' ? "#276EF1" : "#FFFFFF"}
                />
                <Text style={[
                  styles.accountTypeText,
                  accountType === 'card' && styles.accountTypeTextSelected
                ]}>
                  Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.accountTypeOption,
                  accountType === 'paypal' && styles.accountTypeSelected
                ]}
                onPress={() => setAccountType('paypal')}
              >
                <Ionicons
                  name="logo-paypal"
                  size={22}
                  color={accountType === 'paypal' ? "#276EF1" : "#FFFFFF"}
                />
                <Text style={[
                  styles.accountTypeText,
                  accountType === 'paypal' && styles.accountTypeTextSelected
                ]}>
                  PayPal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.accountTypeOption,
                  accountType === 'crypto' && styles.accountTypeSelected
                ]}
                onPress={() => setAccountType('crypto')}
              >
                <Ionicons
                  name="logo-bitcoin"
                  size={22}
                  color={accountType === 'crypto' ? "#276EF1" : "#FFFFFF"}
                />
                <Text style={[
                  styles.accountTypeText,
                  accountType === 'crypto' && styles.accountTypeTextSelected
                ]}>
                  Crypto
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {accountType === 'bank' ? 'Bank Name' :
               accountType === 'card' ? 'Card Name' :
               accountType === 'paypal' ? 'PayPal Account' : 'Crypto Wallet'}
            </Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder={accountType === 'bank' ? "e.g. Chase Bank" :
                          accountType === 'card' ? "e.g. Visa Credit" :
                          accountType === 'paypal' ? "e.g. PayPal" : "e.g. Coinbase"}
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {accountType === 'bank' ? 'Account Number' :
               accountType === 'card' ? 'Card Number' :
               accountType === 'paypal' ? 'Email Address' : 'Wallet Address'}
            </Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder={accountType === 'bank' ? "Enter account number" :
                          accountType === 'card' ? "Enter card number" :
                          accountType === 'paypal' ? "Enter PayPal email" : "Enter wallet address"}
              placeholderTextColor="#666666"
              keyboardType={accountType === 'paypal' ? "email-address" : "default"}
              secureTextEntry={accountType === 'bank' || accountType === 'card'}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Balance</Text>
            <TextInput
              style={styles.input}
              value={accountBalance}
              onChangeText={setAccountBalance}
              placeholder="Enter balance"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              (!accountName || !accountNumber) && styles.addButtonDisabled
            ]}
            disabled={!accountName || !accountNumber}
            onPress={() => {
              // Create new account and add to list
              const newAccount = {
                id: Date.now().toString(),
                type: accountType,
                name: accountName,
                number: accountType === 'bank' || accountType === 'card' ? '••••' + accountNumber.slice(-4) : null,
                email: accountType === 'paypal' ? accountNumber.charAt(0) + '•••@' + accountNumber.split('@')[1] : null,
                address: accountType === 'crypto' ? '••••••' + accountNumber.slice(-4) : null,
                balance: parseFloat(accountBalance) || 0,
                isDefault: false,
                iconName: accountType === 'bank' ? 'business' :
                         accountType === 'card' ? 'card' :
                         accountType === 'paypal' ? 'logo-paypal' : 'logo-bitcoin',
                connected: true,
                lastSync: 'Just now'
              };

              setAccounts([...accounts, newAccount]);
              setNewAccountVisible(false);

              // Reset form
              setAccountName('');
              setAccountNumber('');
              setAccountBalance('');

              Alert.alert('Connected', `${accountName} has been connected to your expense tracker.`);
            }}
          >
            <Text style={styles.addButtonText}>Connect Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screenPadding}>
          <View style={styles.header}>
            <Text style={styles.title}>Accounts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAccount')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Top Buttons */}
          <View style={styles.topButtonsContainer}>
            <TouchableOpacity
              style={[styles.topButton, selectedTopButton === 'netWorth' && styles.topButtonActive]}
              onPress={() => setSelectedTopButton('netWorth')}
            >
              <Text style={[styles.topButtonText, selectedTopButton === 'netWorth' && styles.topButtonTextActive]}>Net Worth</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.topButton, selectedTopButton === 'cash' && styles.topButtonActive]}
              onPress={() => setSelectedTopButton('cash')}
            >
              <Text style={[styles.topButtonText, selectedTopButton === 'cash' && styles.topButtonTextActive]}>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.topButton, selectedTopButton === 'creditCards' && styles.topButtonActive]}
              onPress={() => setSelectedTopButton('creditCards')}
            >
              <Text style={[styles.topButtonText, selectedTopButton === 'creditCards' && styles.topButtonTextActive]}>Credit Cards</Text>
            </TouchableOpacity>
          </View>

          {/* Graph Section */}
          <View style={styles.graphSection}>
            {renderGraph()}
          </View>

          {/* Timeline Controls */}
          <View style={styles.graphControls}>
            <TouchableOpacity
              style={[styles.timeButton, selectedTimeline === '1W' && styles.timeButtonActive]}
              onPress={() => setSelectedTimeline('1W')}
            >
              <Text style={[styles.timeButtonText, selectedTimeline === '1W' && styles.timeButtonTextActive]}>1W</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTimeline === '1M' && styles.timeButtonActive]}
              onPress={() => setSelectedTimeline('1M')}
            >
              <Text style={[styles.timeButtonText, selectedTimeline === '1M' && styles.timeButtonTextActive]}>1M</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTimeline === '3M' && styles.timeButtonActive]}
              onPress={() => setSelectedTimeline('3M')}
            >
              <Text style={[styles.timeButtonText, selectedTimeline === '3M' && styles.timeButtonTextActive]}>3M</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTimeline === '6M' && styles.timeButtonActive]}
              onPress={() => setSelectedTimeline('6M')}
            >
              <Text style={[styles.timeButtonText, selectedTimeline === '6M' && styles.timeButtonTextActive]}>6M</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTimeline === '1Y' && styles.timeButtonActive]}
              onPress={() => setSelectedTimeline('1Y')}
            >
              <Text style={[styles.timeButtonText, selectedTimeline === '1Y' && styles.timeButtonTextActive]}>1Y</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, selectedTimeline === 'ALL' && styles.timeButtonActive]}
              onPress={() => setSelectedTimeline('ALL')}
            >
              <Text style={[styles.timeButtonText, selectedTimeline === 'ALL' && styles.timeButtonTextActive]}>ALL</Text>
            </TouchableOpacity>
          </View>

          {/* Account Tiles */}
          <View style={styles.tilesSection}>
            {renderAccountTiles()}
          </View>
        </View>
      </ScrollView>

      {renderNewAccountModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 75,
  },
  screenPadding: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  topButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  topButtonActive: {
    backgroundColor: '#2980b9',
  },
  topButtonText: {
    color: '#bdc3c7',
    fontSize: 14,
    fontWeight: '500',
  },
  topButtonTextActive: {
    color: '#ffffff',
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  accountFooter: {
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    paddingTop: 12,
  },
  accountStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#3a3a3a',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  accountTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  accountTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
  },
  accountTypeSelected: {
    backgroundColor: 'rgba(41, 128, 185, 0.2)',
    borderWidth: 1,
    borderColor: '#2980b9',
  },
  accountTypeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  accountTypeTextSelected: {
    color: '#2980b9',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 0,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonDisabled: {
    backgroundColor: '#3a3a3a',
    opacity: 0.7,
  },
  accountDetailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  accountDetailsInfo: {
    marginLeft: 15,
  },
  accountDetailsName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  accountDetailsNumber: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginVertical: 15,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  subscriptionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 2,
  },
  savingsText: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 5,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#2980b9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  syncAction: {
    backgroundColor: '#2980b9',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  graphSection: {
    marginBottom: 40,
  },
  graphInfoContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  graphValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  graphGrowth: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  graphDate: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 4,
  },
  graphControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  timeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  timeButtonActive: {
    backgroundColor: '#2980b9',
  },
  timeButtonText: {
    color: '#bdc3c7',
    fontSize: 12,
    fontWeight: '500',
  },
  timeButtonTextActive: {
    color: '#ffffff',
  },
  graphWrapper: {
    position: 'relative',
    height: 220,
    marginBottom: 20,
    overflow: 'hidden',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
    height: 220,
    width: screenWidth,
  },
  verticalLine: {
    position: 'absolute',
    top: 20,
    width: 1,
    height: 165,
    backgroundColor: '#3a3a3a',
    zIndex: 2,
  },
  pointIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2980b9',
    zIndex: 3,
    transform: [{ translateY: -4 }, { translateX: -4 }],
  },
  graphContainer: {
    backgroundColor: '#121212',
    borderRadius: 0,
    padding: 16,
    height: 250,
    marginBottom: 20,
  },
  tilesSection: {
    marginTop: 0,
  },
  accountTilesContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  accountTile: {
    width: '100%',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    paddingBottom: 20,
    height: 100,
  },
  accountTileActive: {
    backgroundColor: '#333333',
  },
  tileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
  },
  tileLeft: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tileRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileInfo: {
    marginLeft: 0,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tileSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 4,
  },
  tileGrowth: {
    fontSize: 14,
    fontWeight: '600',
  },
  tileAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tilePercentage: {
    fontSize: 14,
    marginBottom: 3,
    color: '#bdc3c7',
  },
  expandedAccounts: {
    backgroundColor: '#252525',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    marginTop: -12,
  },
  expandedAccount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  expandedAccountLeft: {
    flex: 1,
  },
  expandedAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandedAccountName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  expandedAccountDetails: {
    marginLeft: 28,
    marginTop: 4,
  },
  expandedAccountType: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  expandedAccountRight: {
    alignItems: 'flex-end',
  },
  expandedAccountBalance: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expandedAccountSync: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bdc3c7',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: 'rgba(189, 195, 199, 0.1)',
  },
  addAccountButtonText: {
    color: '#bdc3c7',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default AccountsScreen;
