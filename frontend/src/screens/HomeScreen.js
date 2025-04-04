import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Constants for the chart size
const CHART_RADIUS = Math.min(width - 100, 240) / 2;
const INNER_RADIUS = CHART_RADIUS * 0.55;

// Mock data
const monthlyEarned = 2850;
const monthlySpent = 950;

const categoryData = [
  {
    name: 'Food',
    amount: 450,
    color: '#FF6384',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
  {
    name: 'Transport',
    amount: 250,
    color: '#36A2EB',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
  {
    name: 'Shopping',
    amount: 200,
    color: '#FFCE56',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
  {
    name: 'Bills',
    amount: 150,
    color: '#4BC0C0',
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  },
];

// Function to generate pie chart slices
const generatePieChartPath = (index, data, radius, innerRadius) => {
  // Calculate total
  const total = data.reduce((acc, item) => acc + item.amount, 0);
  
  // Calculate start and end angles
  let startAngle = 0;
  for (let i = 0; i < index; i++) {
    const angle = (data[i].amount / total) * 2 * Math.PI;
    startAngle += angle;
  }
  
  const angle = (data[index].amount / total) * 2 * Math.PI;
  const endAngle = startAngle + angle;
  
  // Calculate coordinates
  const centerX = radius;
  const centerY = radius;
  
  // Starting point
  const startX = centerX + Math.cos(startAngle) * radius;
  const startY = centerY + Math.sin(startAngle) * radius;
  
  // End point
  const endX = centerX + Math.cos(endAngle) * radius;
  const endY = centerY + Math.sin(endAngle) * radius;
  
  // Inner points for donut
  const innerStartX = centerX + Math.cos(startAngle) * innerRadius;
  const innerStartY = centerY + Math.sin(startAngle) * innerRadius;
  const innerEndX = centerX + Math.cos(endAngle) * innerRadius;
  const innerEndY = centerY + Math.sin(endAngle) * innerRadius;
  
  // Large arc flag
  const largeArcFlag = angle > Math.PI ? 1 : 0;
  
  // Create SVG path with slightly adjusted padding for better appearance
  return `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
    L ${innerEndX} ${innerEndY}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
    Z
  `;
};

const recentExpenses = [
  {
    id: 1,
    title: 'Grocery Shopping',
    category: 'Food',
    amount: 85.25,
    date: '15 Jun',
    icon: 'fast-food',
    color: '#FF6384',
  },
  {
    id: 2,
    title: 'Uber Ride',
    category: 'Transport',
    amount: 24.50,
    date: '14 Jun',
    icon: 'car',
    color: '#36A2EB',
  },
  {
    id: 3,
    title: 'New Headphones',
    category: 'Shopping',
    amount: 159.99,
    date: '12 Jun',
    icon: 'cart',
    color: '#FFCE56',
  },
];

const HomeScreen = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Calculate percentages and prepare data
  const total = categoryData.reduce((acc, item) => acc + item.amount, 0);
  const formattedCategoryData = categoryData.map((item) => ({
    ...item,
    percentage: Math.round((item.amount / total) * 100),
  }));

  // Handle slice press with animation
  const handleSlicePress = (index) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change the content
      setActiveIndex(activeIndex === index ? null : index);
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  // Use the constants for the chart
  const chartRadius = CHART_RADIUS;
  const innerRadius = INNER_RADIUS;
  const centerX = chartRadius;
  const centerY = chartRadius;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.screenPadding}>
          {/* Overview Section */}
          <View style={styles.overviewContainer}>
            <View style={styles.overviewHeader}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Ionicons name="wallet-outline" size={24} color="#276EF1" />
            </View>
            
            <Text style={styles.balance}>$2,450.00</Text>
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          
          {/* Tiles for Monthly Earned and Monthly Spent */}
          <View style={styles.tilesContainer}>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>Monthly Earned</Text>
              <Text style={[styles.tileAmount, styles.earnedAmount]}>${monthlyEarned.toFixed(2)}</Text>
              <View style={styles.tileIconContainer}>
                <Ionicons name="trending-up" size={24} color="#4BC0C0" />
              </View>
            </View>
            
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>Monthly Spent</Text>
              <Text style={[styles.tileAmount, styles.spentAmount]}>${monthlySpent.toFixed(2)}</Text>
              <View style={styles.tileIconContainer}>
                <Ionicons name="trending-down" size={24} color="#FF6384" />
              </View>
            </View>
          </View>
          
          {/* Activity Section with Pie Chart */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <Text style={styles.sectionSubtitle}>Spending by Category</Text>
            
            <View style={styles.chartAndLegendWrapper}>
              {/* Left side: Pie Chart */}
              <View style={styles.chartContainer}>
                {/* Pie Chart */}
                <Svg width={chartRadius * 2} height={chartRadius * 2}>
                  <G>
                    {formattedCategoryData.map((item, index) => (
                      <Path
                        key={index}
                        d={generatePieChartPath(index, categoryData, chartRadius, innerRadius)}
                        fill={item.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                        stroke="#1a1a1a"
                        strokeWidth={1}
                        onPress={() => handleSlicePress(index)}
                      />
                    ))}
                    <Circle
                      cx={centerX}
                      cy={centerY}
                      r={innerRadius}
                      fill="#1a1a1a"
                      stroke="#333333"
                      strokeWidth={2}
                    />
                  </G>
                </Svg>
                
                {/* Center Display */}
                <Animated.View style={[styles.chartCenterView, { opacity: fadeAnim }]}>
                  <View style={styles.chartCenterContent}>
                    <Text style={styles.chartCenterValue} numberOfLines={1} adjustsFontSizeToFit>
                      {activeIndex !== null 
                        ? `$${formattedCategoryData[activeIndex].amount.toFixed(2)}`
                        : `$${total.toFixed(2)}`
                      }
                    </Text>
                    <Text style={styles.chartCenterLabel} numberOfLines={1}>
                      {activeIndex !== null 
                        ? formattedCategoryData[activeIndex].name
                        : "Monthly Spent"
                      }
                    </Text>
                  </View>
                </Animated.View>
              </View>
              
              {/* Categories below the chart */}
              <View style={styles.legendContainer}>
                <View style={styles.legendGrid}>
                  {formattedCategoryData.map((category, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.legendItem,
                        activeIndex === index && styles.activeLegendItem
                      ]}
                      onPress={() => handleSlicePress(index)}
                    >
                      <View style={[styles.legendColorDot, { backgroundColor: category.color }]} />
                      <Text style={styles.legendLabel}>{category.name}</Text>
                      <Text style={styles.legendValue}>
                        {activeIndex === index 
                          ? `$${category.amount.toFixed(2)}` 
                          : `${category.percentage}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
          
          {/* Recent Expenses */}
          <View style={styles.expenseContainer}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            
            {recentExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={[styles.expenseIcon, { backgroundColor: expense.color }]}>
                  <Ionicons name={expense.icon} size={20} color="#FFFFFF" />
                </View>
                
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseTitle}>{expense.title}</Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
                
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
                  <Text style={styles.expenseDate}>{expense.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenPadding: {
    padding: 20,
  },
  overviewContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balance: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  tilesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tile: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    position: 'relative',
    overflow: 'hidden',
  },
  tileLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  tileAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  earnedAmount: {
    color: '#4BC0C0',
  },
  spentAmount: {
    color: '#FF6384',
  },
  tileIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0.8,
  },
  activityContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 25,
  },
  chartAndLegendWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  chartContainer: {
    position: 'relative',
    height: CHART_RADIUS * 2,
    width: CHART_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  chartCenterView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCenterContent: {
    width: INNER_RADIUS * 1.9,
    height: INNER_RADIUS * 1.9,
    borderRadius: INNER_RADIUS * 0.95,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  chartCenterValue: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartCenterLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: 10,
  },
  legendGrid: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#252525',
    borderRadius: 10,
  },
  legendColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
  },
  legendLabel: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  activeLegendItem: {
    backgroundColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  expenseContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  expenseCategory: {
    fontSize: 13,
    color: '#666666',
    marginTop: 3,
  },
  expenseDetails: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    color: '#FF6384',
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 13,
    color: '#666666',
    marginTop: 3,
  },
});

export default HomeScreen; 