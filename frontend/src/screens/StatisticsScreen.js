import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, PanResponder, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { getTransactions, getSmartTip } from '../services/transactionsService';

const { width } = Dimensions.get('window');

// Mock data for statistics
const statisticsData = {
  weekly: {
    totalSpent: 524.35,
    previousPeriodSpent: 560.20,
    improvementPercentage: 6.4,
    topCategories: [
      { name: 'Food', amount: 215.75, percentage: 41, color: '#FF6384', icon: 'fast-food' },
      { name: 'Transport', amount: 148.50, percentage: 28, color: '#36A2EB', icon: 'car' },
      { name: 'Shopping', amount: 95.40, percentage: 18, color: '#FFCE56', icon: 'cart' },
    ],
    paymentMethods: [
      { name: 'Credit Card', amount: 320.25, percentage: 61, color: '#FF6384', icon: 'card' },
      { name: 'Cash', amount: 145.60, percentage: 28, color: '#4BC0C0', icon: 'cash' },
      { name: 'Mobile Pay', amount: 58.50, percentage: 11, color: '#9966FF', icon: 'phone-portrait' },
    ],
    trend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [65, 45, 112, 78, 98, 75, 51],
          color: (opacity = 1) => `rgba(39, 110, 241, ${opacity})`,
        }
      ]
    },
    monthComparison: {
      currentMonth: 'May',
      previousMonth: 'April',
      categories: [
        { name: 'Food', current: 215.75, previous: 236.30, improvement: 8.7 },
        { name: 'Transport', current: 148.50, previous: 162.75, improvement: 8.8 },
        { name: 'Shopping', current: 95.40, previous: 101.25, improvement: 5.8 },
      ]
    }
  },
  monthly: {
    totalSpent: 2150.80,
    previousPeriodSpent: 2320.45,
    improvementPercentage: 7.3,
    topCategories: [
      { name: 'Food', amount: 750.25, percentage: 35, color: '#FF6384', icon: 'fast-food' },
      { name: 'Bills', amount: 435.65, percentage: 20, color: '#4BC0C0', icon: 'flash' },
      { name: 'Shopping', amount: 395.75, percentage: 18, color: '#FFCE56', icon: 'cart' },
    ],
    paymentMethods: [
      { name: 'Credit Card', amount: 1290.45, percentage: 60, color: '#FF6384', icon: 'card' },
      { name: 'Cash', amount: 537.70, percentage: 25, color: '#4BC0C0', icon: 'cash' },
      { name: 'Mobile Pay', amount: 322.65, percentage: 15, color: '#9966FF', icon: 'phone-portrait' },
    ],
    trend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          data: [485, 590, 512, 563],
          color: (opacity = 1) => `rgba(39, 110, 241, ${opacity})`,
        }
      ]
    },
    monthComparison: {
      currentMonth: 'May',
      previousMonth: 'April',
      categories: [
        { name: 'Food', current: 750.25, previous: 820.50, improvement: 8.6 },
        { name: 'Bills', current: 435.65, previous: 445.20, improvement: 2.1 },
        { name: 'Shopping', current: 395.75, previous: 440.30, improvement: 10.1 },
        { name: 'Transport', current: 320.40, previous: 350.70, improvement: 8.6 },
        { name: 'Other', current: 248.75, previous: 263.75, improvement: 5.7 }
      ]
    }
  },
  yearly: {
    totalSpent: 24680.55,
    previousPeriodSpent: 26540.80,
    improvementPercentage: 7.0,
    topCategories: [
      { name: 'Bills', amount: 7850.45, percentage: 32, color: '#4BC0C0', icon: 'flash' },
      { name: 'Food', amount: 6750.80, percentage: 27, color: '#FF6384', icon: 'fast-food' },
      { name: 'Shopping', amount: 4250.65, percentage: 17, color: '#FFCE56', icon: 'cart' },
    ],
    paymentMethods: [
      { name: 'Credit Card', amount: 15802.75, percentage: 64, color: '#FF6384', icon: 'card' },
      { name: 'Cash', amount: 4936.10, percentage: 20, color: '#4BC0C0', icon: 'cash' },
      { name: 'Mobile Pay', amount: 2469.65, percentage: 10, color: '#9966FF', icon: 'phone-portrait' },
      { name: 'Bank Transfer', amount: 1472.05, percentage: 6, color: '#FFCE56', icon: 'sync' },
    ],
    trend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: [1850, 1720, 2105, 1960, 2085, 1995, 2230, 2150, 1980, 2305, 2180, 2120],
          color: (opacity = 1) => `rgba(39, 110, 241, ${opacity})`,
        }
      ]
    },
    monthComparison: {
      currentMonth: 'This Year',
      previousMonth: 'Last Year',
      categories: [
        { name: 'Bills', current: 7850.45, previous: 8320.25, improvement: 5.6 },
        { name: 'Food', current: 6750.80, previous: 7430.55, improvement: 9.1 },
        { name: 'Shopping', current: 4250.65, previous: 4780.30, improvement: 11.1 },
        { name: 'Transport', current: 2980.35, previous: 3150.70, improvement: 5.4 },
        { name: 'Entertainment', current: 1548.20, previous: 1660.45, improvement: 6.8 },
        { name: 'Other', current: 1300.10, previous: 1198.55, improvement: -8.5 }
      ]
    }
  }
};

// Add income statistics mock data
const incomeStatisticsData = {
  weekly: {
    totalEarned: 750.00,
    previousPeriodEarned: 725.00,
    growthPercentage: 3.4,
    topCategories: [
      { name: 'Salary', amount: 580.00, percentage: 77, color: '#4BC0C0', icon: 'cash' },
      { name: 'Freelance', amount: 120.00, percentage: 16, color: '#36A2EB', icon: 'laptop' },
      { name: 'Other', amount: 50.00, percentage: 7, color: '#9966FF', icon: 'add-circle' },
    ],
    incomeSources: [
      { name: 'Employer', amount: 580.00, percentage: 77, color: '#4BC0C0', icon: 'business' },
      { name: 'Clients', amount: 120.00, percentage: 16, color: '#36A2EB', icon: 'person' },
      { name: 'Investments', amount: 50.00, percentage: 7, color: '#FFCE56', icon: 'stats-chart' },
    ],
    trend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [120, 0, 0, 0, 580, 50, 0],
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        }
      ]
    },
    monthComparison: {
      currentMonth: 'May',
      previousMonth: 'April',
      categories: [
        { name: 'Salary', current: 580.00, previous: 580.00, improvement: 0 },
        { name: 'Freelance', current: 120.00, previous: 95.00, improvement: -26.3 },
        { name: 'Other', current: 50.00, previous: 50.00, improvement: 0 },
      ]
    }
  },
  monthly: {
    totalEarned: 3180.00,
    previousPeriodEarned: 3050.00,
    growthPercentage: 4.3,
    topCategories: [
      { name: 'Salary', amount: 2500.00, percentage: 79, color: '#4BC0C0', icon: 'cash' },
      { name: 'Freelance', amount: 550.00, percentage: 17, color: '#36A2EB', icon: 'laptop' },
      { name: 'Investments', amount: 130.00, percentage: 4, color: '#FFCE56', icon: 'trending-up' },
    ],
    incomeSources: [
      { name: 'Employer', amount: 2500.00, percentage: 79, color: '#4BC0C0', icon: 'business' },
      { name: 'Clients', amount: 550.00, percentage: 17, color: '#36A2EB', icon: 'person' },
      { name: 'Investments', amount: 130.00, percentage: 4, color: '#FFCE56', icon: 'stats-chart' },
    ],
    trend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          data: [750, 760, 870, 800],
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        }
      ]
    },
    monthComparison: {
      currentMonth: 'May',
      previousMonth: 'April',
      categories: [
        { name: 'Salary', current: 2500.00, previous: 2500.00, improvement: 0 },
        { name: 'Freelance', current: 550.00, previous: 430.00, improvement: -27.9 },
        { name: 'Investments', current: 130.00, previous: 120.00, improvement: -8.3 },
      ]
    }
  },
  yearly: {
    totalEarned: 38150.00,
    previousPeriodEarned: 36500.00,
    growthPercentage: 4.5,
    topCategories: [
      { name: 'Salary', amount: 30000.00, percentage: 79, color: '#4BC0C0', icon: 'cash' },
      { name: 'Freelance', amount: 6450.00, percentage: 17, color: '#36A2EB', icon: 'laptop' },
      { name: 'Investments', amount: 1700.00, percentage: 4, color: '#FFCE56', icon: 'trending-up' },
    ],
    incomeSources: [
      { name: 'Employer', amount: 30000.00, percentage: 79, color: '#4BC0C0', icon: 'business' },
      { name: 'Clients', amount: 6450.00, percentage: 17, color: '#36A2EB', icon: 'person' },
      { name: 'Investments', amount: 1700.00, percentage: 4, color: '#FFCE56', icon: 'stats-chart' },
    ],
    trend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: [3050, 3050, 3100, 3050, 3180, 3200, 3150, 3200, 3250, 3300, 3320, 3300],
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        }
      ]
    },
    monthComparison: {
      currentMonth: 'This Year',
      previousMonth: 'Last Year',
      categories: [
        { name: 'Salary', current: 30000.00, previous: 29000.00, improvement: -3.4 },
        { name: 'Freelance', current: 6450.00, previous: 5800.00, improvement: -11.2 },
        { name: 'Investments', current: 1700.00, previous: 1700.00, improvement: 0 },
      ]
    }
  }
};

// Simple Line Chart Component
const SimpleLineChart = ({ data, labels, width, height }) => {
  const [activePointIndex, setActivePointIndex] = useState(null);

  // Validate input data
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(labels)) {
    return (
      <Svg width={width} height={height}>
        <SvgText
          x={width / 2}
          y={height / 2}
          fill="#fff"
          fontSize="12"
          textAnchor="middle"
        >
          No data available
        </SvgText>
      </Svg>
    );
  }

  // Padding values
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 40;
  const paddingBottom = 40;

  // Calculate available space for the chart
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value in data with validation
  const validData = data.filter(value => typeof value === 'number' && !isNaN(value));
  const maxValue = validData.length > 0
    ? Math.max(...validData) * 1.1 // Add 10% padding
    : 100; // Default max value if no valid data

  // Get coordinates for a data point with validation
  const getX = (index) => {
    const x = paddingLeft + (index * chartWidth) / (data.length - 1);
    return isNaN(x) ? paddingLeft : x;
  };

  const getY = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return paddingTop + chartHeight;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return isNaN(y) ? paddingTop + chartHeight : y;
  };

  // Create pan responder for touch interaction
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX - paddingLeft;
      if (x >= 0 && x <= chartWidth) {
        const index = Math.round((x / chartWidth) * (data.length - 1));
        if (index >= 0 && index < data.length) {
          setActivePointIndex(index);
        }
      }
    },
    onPanResponderRelease: () => {
      setActivePointIndex(null);
    },
  });

  // Format value with appropriate suffix
  const formatValue = (value) => {
    if (!value || isNaN(value)) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  const renderChart = () => {
    try {
      // Generate path for the line with validation
      let path = '';
      let hasValidPoints = false;

      data.forEach((value, index) => {
        if (typeof value === 'number' && !isNaN(value)) {
          const x = getX(index);
          const y = getY(value);

          if (!hasValidPoints) {
            path += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
            hasValidPoints = true;
          } else {
            path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
          }
        }
      });

      // If no valid points were found, return empty chart
      if (!hasValidPoints) {
        return (
          <Svg width={width} height={height}>
            <SvgText
              x={width / 2}
              y={height / 2}
              fill="#fff"
              fontSize="12"
              textAnchor="middle"
            >
              Invalid data
            </SvgText>
          </Svg>
        );
      }

      return (
        <Svg width={width} height={height}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = getY(maxValue * ratio);
            return (
              <G key={`grid-${i}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#666666"
                  fontSize="10"
                  textAnchor="end"
                >
                  {formatValue(maxValue * ratio)}
                </SvgText>
              </G>
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, i) => (
            <SvgText
              key={`label-${i}`}
              x={getX(i)}
              y={height - paddingBottom + 20}
              fill="#666666"
              fontSize="10"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}

          {/* Line path */}
          <Path
            d={path}
            stroke="#276EF1"
            strokeWidth="2"
            fill="none"
          />

          {/* Data points */}
          {data.map((value, index) => {
            if (typeof value !== 'number' || isNaN(value)) return null;
            return (
              <Circle
                key={`point-${index}`}
                cx={getX(index)}
                cy={getY(value)}
                r={activePointIndex === index ? 6 : 4}
                fill={activePointIndex === index ? "#fff" : "#276EF1"}
                stroke="#276EF1"
                strokeWidth="2"
              />
            );
          })}

          {/* Active point value */}
          {activePointIndex !== null && typeof data[activePointIndex] === 'number' && !isNaN(data[activePointIndex]) && (
            <G>
              <Circle
                cx={getX(activePointIndex)}
                cy={getY(data[activePointIndex])}
                r="6"
                fill="#fff"
                stroke="#276EF1"
                strokeWidth="2"
              />
              <SvgText
                x={getX(activePointIndex) - 25}
                y={getY(data[activePointIndex]) - 12}
                fill="#fff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="start"
              >
                $
              </SvgText>
              <SvgText
                x={getX(activePointIndex) - 15}
                y={getY(data[activePointIndex]) - 12}
                fill="#fff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="start"
              >
                {formatValue(data[activePointIndex])}
              </SvgText>
            </G>
          )}
        </Svg>
      );
    } catch (error) {
      console.log('Chart render error:', error);
      return (
        <Svg width={width} height={height}>
          <SvgText
            x={width / 2}
            y={height / 2}
            fill="#fff"
            fontSize="12"
            textAnchor="middle"
          >
            Chart data unavailable
          </SvgText>
        </Svg>
      );
    }
  };

  return (
    <View
      style={{ width, height, backgroundColor: '#1a1a1a', borderRadius: 12 }}
      {...panResponder.panHandlers}
    >
      {renderChart()}
    </View>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, labels, width, height, colors }) => {
  const [activeBarIndex, setActiveBarIndex] = useState(null);

  // Padding values - increase significantly to make room for labels
  const paddingLeft = 80;
  const paddingRight = 20;
  const paddingTop = 40;
  const paddingBottom = 40;

  // Calculate available space for the chart
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value in data
  const maxValue = Math.max(...data);

  // Bar width calculation
  const barWidth = chartWidth / data.length / 2;
  const barSpacing = chartWidth / data.length;

  // Handle bar press
  const handleBarPress = (index) => {
    setActiveBarIndex(prev => prev === index ? null : index);
  };

  // Generate Y-axis labels with proper formatting
  const yAxisLabels = [];
  const numYLabels = 5;
  for (let i = 0; i < numYLabels; i++) {
    const value = Math.round((maxValue / (numYLabels - 1)) * i);
    yAxisLabels.push(value);
  }

  // Function to get Y coordinate based on value
  const getY = (value) => paddingTop + chartHeight - (value / maxValue) * chartHeight;

  // Format value with appropriate suffix
  const formatValue = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  return (
    <View style={{ width, height, backgroundColor: '#1a1a1a', borderRadius: 12 }}>
      <Svg width={width} height={height}>
        {/* Y-axis line */}
        <Line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={paddingTop + chartHeight}
          stroke="#333"
          strokeWidth="1"
        />

        {/* X-axis line */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={paddingLeft + chartWidth}
          y2={paddingTop + chartHeight}
          stroke="#333"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {yAxisLabels.map((value, i) => (
          <Line
            key={`grid-${i}`}
            x1={paddingLeft}
            y1={getY(value)}
            x2={paddingLeft + chartWidth}
            y2={getY(value)}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis title showing currency */}
        <SvgText
          x={paddingLeft - 40}
          y={paddingTop - 10}
          fill="#999999"
          fontSize="12"
          textAnchor="center"
        >
          Amount ($)
        </SvgText>

        {/* Y-axis labels */}
        {yAxisLabels.map((value, i) => (
          <SvgText
            key={`y-label-${i}`}
            x={paddingLeft - 10}
            y={getY(value) + 4}
            fill="#666666"
            fontSize="10"
            textAnchor="end"
          >
            {formatValue(value)}
          </SvgText>
        ))}

        {/* Bars */}
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * chartHeight;
          const barX = paddingLeft + index * barSpacing + barSpacing/4;
          const barY = paddingTop + chartHeight - barHeight;
          const color = colors[index % colors.length];
          const isActive = activeBarIndex === index;

          return (
            <G key={`bar-${index}`} onPress={() => handleBarPress(index)}>
              <Rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={color}
                fillOpacity={isActive ? 1 : 0.7}
                rx={5}
              />

              <SvgText
                x={barX + barWidth/2}
                y={barY - 5}
                fill="#fff"
                fontSize={isActive ? "12" : "10"}
                fontWeight={isActive ? "bold" : "normal"}
                textAnchor="middle"
              >
                ${formatValue(value)}
              </SvgText>

              <SvgText
                x={barX + barWidth/2}
                y={paddingTop + chartHeight + 20}
                fill={isActive ? "#fff" : "#666"}
                fontSize="10"
                fontWeight={isActive ? "bold" : "normal"}
                textAnchor="middle"
              >
                {labels[index].length > 5 ? labels[index].substring(0, 5) + '...' : labels[index]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// New Component for Month-to-Month Comparison - COMPLETELY OVERHAULED DESIGN
const MonthComparisonChart = ({ data, width, height, isIncome = false }) => {
  // Safely destructure with defaults
  const {
    currentMonth = '',
    previousMonth = '',
    categories = [],
    currentTotal = 0,
    previousTotal = 0,
    overallGrowth = 0
  } = data || {};

  // Calculate overall growth using the new formula
  const calculateGrowth = (newValue, oldValue) => {
    if (oldValue === 0) {
      return ((newValue) / 1);
    }
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  };

  const isOverallImprovement = isIncome ? overallGrowth > 0 : overallGrowth < 0; // For income, positive growth is improvement
  const improvementColor = isIncome ? '#4BC0C0' : '#FF6384';
  const declineColor = isIncome ? '#FF6384' : '#4BC0C0';

  return (
    <View style={{ width: '100%', backgroundColor: '#111', borderRadius: 12, padding: 0, overflow: 'hidden' }}>
      {/* Summary header */}
      <View style={{
        backgroundColor: '#181818',
        padding: 20,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#282828'
      }}>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>Overall Change</Text>
          <View style={{
            backgroundColor: isOverallImprovement
              ? (isIncome ? 'rgba(75, 192, 192, 0.1)' : 'rgba(255, 99, 132, 0.1)')
              : (isIncome ? 'rgba(255, 99, 132, 0.1)' : 'rgba(75, 192, 192, 0.1)'),
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: isOverallImprovement ? improvementColor : declineColor,
            width: '100%',
          }}>
            <Text style={{
              color: isOverallImprovement ? improvementColor : declineColor,
              fontSize: 18,
              fontWeight: 'bold'
            }}>
              {isOverallImprovement ? '↑' : '↓'} {Math.abs(calculateGrowth(currentTotal, previousTotal)).toFixed(1)}% from previous period
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '46%' }}>
            <Text style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>Current</Text>
            <Text style={{ color: '#4BC0C0', fontSize: 24, fontWeight: 'bold' }}>
              ${currentTotal.toFixed(0)}
            </Text>
          </View>

          <View style={{ width: '46%' }}>
            <Text style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>Previous</Text>
            <Text style={{ color: '#FF6384', fontSize: 24, fontWeight: 'bold' }}>
              ${previousTotal.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ maxHeight: 350, paddingHorizontal: 15, marginBottom: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => {
          const {
            name = 'Unknown',
            current = 0,
            previous = 0
          } = category || {};

          const growth = calculateGrowth(current, previous);
          const isImprovement = isIncome ? growth > 0 : growth < 0; // For income, positive growth is improvement
          const changeColor = isImprovement ? improvementColor : declineColor;
          const improvementText = isImprovement ? 'more than' : 'less than';

          return (
            <View key={index} style={{
              backgroundColor: '#181818',
              borderRadius: 10,
              padding: 15,
              marginBottom: 12,
              borderLeftWidth: 4,
              borderLeftColor: changeColor,
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 12
              }}>
                {name}
              </Text>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <View style={{ width: '46%' }}>
                  <Text style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Current</Text>
                  <Text style={{ color: improvementColor, fontSize: 18, fontWeight: '600' }}>
                    ${current.toFixed(0)}
                  </Text>
                </View>

                <View style={{ width: '46%' }}>
                  <Text style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Previous</Text>
                  <Text style={{ color: declineColor, fontSize: 18, fontWeight: '600' }}>
                    ${previous.toFixed(0)}
                  </Text>
                </View>
              </View>

              <View style={{
                backgroundColor: isImprovement
                  ? (isIncome ? 'rgba(75, 192, 192, 0.1)' : 'rgba(255, 99, 132, 0.1)')
                  : (isIncome ? 'rgba(255, 99, 132, 0.1)' : 'rgba(75, 192, 192, 0.1)'),
                padding: 10,
                borderRadius: 6,
              }}>
                <Text style={{ color: changeColor, fontWeight: '500' }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {isImprovement ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                  </Text>
                  {' '}{improvementText} previous period
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Helper functions for data formatting
const formatNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null) return defaultValue;
  return value.toFixed(2);
};

const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Food': 'fast-food',
    'Transport': 'car',
    'Housing': 'home',
    'Entertainment': 'game-controller',
    'Shopping': 'cart',
    'Healthcare': 'medkit',
    'Education': 'school',
    'Salary': 'cash',
    'Investment': 'trending-up',
    'Freelance': 'laptop',
    'Other': 'apps'
  };
  return iconMap[categoryName] || 'apps';
};

const getPaymentMethodIcon = (method) => {
  const iconMap = {
    'Credit Card': 'card',
    'Debit Card': 'card',
    'Cash': 'cash',
    'Bank Transfer': 'sync',
    'Mobile Payment': 'phone-portrait',
    'Other': 'apps'
  };
  return iconMap[method] || 'apps';
};

const getPercentage = (value, total, defaultValue = 0) => {
  if (value === undefined || value === null) return defaultValue;
  return (value / total) * 100;
};

const StatisticsScreen = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [statType, setStatType] = useState('expense');
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });
  const [topCategories, setTopCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [comparisonData, setComparisonData] = useState({
    currentMonth: '',
    previousMonth: '',
    categories: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [smartTip, setSmartTip] = useState({ tip: '', suggestion: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data.items || []);
        console.log('Fetched transactions:', data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchSmartTip();
  }, []);

  useEffect(() => {
    // Calculate total amount, line chart data, top categories, payment methods, and comparison data
    const calculateData = () => {
      const now = new Date();
      let startDate;
      let labels = [];
      let dataPoints = [];

      // Set start date based on timeframe
      switch (timeframe) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          // Generate labels for each day of the week
          for (let i = 0; i < 7; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            dataPoints.push(0); // Initialize with 0
          }
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          // Generate labels for each week of the month
          const weeksInMonth = Math.ceil((now.getDate() + startDate.getDay()) / 7);
          for (let i = 0; i < weeksInMonth; i++) {
            labels.push(`Week ${i + 1}`);
            dataPoints.push(0); // Initialize with 0
          }
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          // Generate labels for each month
          for (let i = 0; i < 12; i++) {
            labels.push(new Date(now.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' }));
            dataPoints.push(0); // Initialize with 0
          }
          break;
      }

      // Filter transactions by date and type
      const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= startDate &&
               txDate <= now &&
               tx.type === (statType === 'expense' ? 'expense' : 'income');
      });

      // Calculate total amount
      const total = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      setTotalAmount(total);

      // Group transactions by time period and calculate sums for line chart
      filteredTransactions.forEach(tx => {
        const txDate = new Date(tx.date);
        let index;

        switch (timeframe) {
          case 'weekly':
            index = Math.floor((txDate - startDate) / (24 * 60 * 60 * 1000));
            break;
          case 'monthly':
            index = Math.floor((txDate.getDate() + startDate.getDay() - 1) / 7);
            break;
          case 'yearly':
            index = txDate.getMonth();
            break;
        }

        if (index >= 0 && index < dataPoints.length) {
          dataPoints[index] = (dataPoints[index] || 0) + Number(tx.amount);
        }
      });

      // Ensure all data points are numbers
      const chartData = dataPoints.map(point => Number(point) || 0);

      setLineChartData({
        labels,
        datasets: [{
          data: chartData,
          color: (opacity = 1) => `rgba(39, 110, 241, ${opacity})`,
        }]
      });

      // Calculate top categories
      const categoryTotals = {};
      filteredTransactions.forEach(tx => {
        const category = tx.category || 'Uncategorized';
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += Number(tx.amount);
      });

      // Convert to array and sort by amount
      const sortedCategories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / total) * 100
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3); // Get top 3 categories

      // Add colors and icons to categories
      const categoryColors = ['#FF6384', '#4BC0C0', '#FFCE56'];
      const categoryIcons = ['fast-food', 'car', 'cart'];

      const categoriesWithStyle = sortedCategories.map((cat, index) => ({
        ...cat,
        color: categoryColors[index],
        icon: categoryIcons[index]
      }));

      setTopCategories(categoriesWithStyle);

      // Calculate payment methods
      const methodTotals = {};
      filteredTransactions.forEach(tx => {
        const method = tx.payment_method || 'Other';
        if (!methodTotals[method]) {
          methodTotals[method] = 0;
        }
        methodTotals[method] += Number(tx.amount);
      });

      // Convert to array and sort by amount
      const sortedMethods = Object.entries(methodTotals)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / total) * 100
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3); // Get top 3 methods

      // Add colors and icons to payment methods
      const methodColors = ['#FF6384', '#4BC0C0', '#FFCE56'];
      const methodIcons = ['card', 'cash', 'phone-portrait'];

      const methodsWithStyle = sortedMethods.map((method, index) => ({
        ...method,
        color: methodColors[index],
        icon: methodIcons[index]
      }));

      setPaymentMethods(methodsWithStyle);

      // Calculate comparison data
      const calculateComparison = () => {
        const now = new Date();
        let currentStartDate, previousStartDate, currentEndDate, previousEndDate;

        switch (timeframe) {
          case 'weekly':
            currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            previousEndDate = currentStartDate;
            currentEndDate = now;
            break;
          case 'monthly':
            currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEndDate = currentStartDate;
            currentEndDate = now;
            break;
          case 'yearly':
            currentStartDate = new Date(now.getFullYear(), 0, 1);
            previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
            previousEndDate = new Date(now.getFullYear(), 0, 1);
            currentEndDate = now;
            break;
        }

        // Get transactions for current and previous periods
        const currentTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= currentStartDate &&
                 txDate <= currentEndDate &&
                 tx.type === (statType === 'expense' ? 'expense' : 'income');
        });

        const previousTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= previousStartDate &&
                 txDate <= previousEndDate &&
                 tx.type === (statType === 'expense' ? 'expense' : 'income');
        });

        // Calculate overall totals for both periods
        const currentTotal = currentTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const previousTotal = previousTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

        // Calculate overall growth percentage with proper handling of edge cases
        const overallGrowth = previousTotal !== 0
          ? ((currentTotal - previousTotal) / Math.abs(previousTotal)) * 100
          : currentTotal > 0 ? ((currentTotal - 1) / 1) * 100 : 0;

        // Calculate totals for each category in both periods
        const currentCategoryTotals = {};
        const previousCategoryTotals = {};

        currentTransactions.forEach(tx => {
          const category = tx.category || 'Uncategorized';
          if (!currentCategoryTotals[category]) {
            currentCategoryTotals[category] = 0;
          }
          currentCategoryTotals[category] += Number(tx.amount);
        });

        previousTransactions.forEach(tx => {
          const category = tx.category || 'Uncategorized';
          if (!previousCategoryTotals[category]) {
            previousCategoryTotals[category] = 0;
          }
          previousCategoryTotals[category] += Number(tx.amount);
        });

        // Combine all categories and calculate growth percentages
        const allCategories = new Set([
          ...Object.keys(currentCategoryTotals),
          ...Object.keys(previousCategoryTotals)
        ]);

        const comparisonCategories = Array.from(allCategories)
          .map(category => {
            const current = currentCategoryTotals[category] || 0;
            const previous = previousCategoryTotals[category] || 0;

            // Calculate growth percentage with proper handling of edge cases
            let growth;
            if (previous === 0) {
              growth = current > 0 ? ((current - 1) / 1) * 100 : 0; // Use 1 as base when no previous data
            } else {
              growth = ((current - previous) / Math.abs(previous)) * 100;
            }

            return {
              name: category,
              current,
              previous,
              growth: Number(growth.toFixed(1)) // Round to 1 decimal place
            };
          })
          .sort((a, b) => b.current - a.current)
          .slice(0, 5); // Get top 5 categories

        // Set month names for the comparison
        const currentMonth = timeframe === 'yearly'
          ? 'This Year'
          : new Date(currentStartDate).toLocaleDateString('en-US', { month: 'long' });

        const previousMonth = timeframe === 'yearly'
          ? 'Last Year'
          : new Date(previousStartDate).toLocaleDateString('en-US', { month: 'long' });

        setComparisonData({
          currentMonth,
          previousMonth,
          categories: comparisonCategories,
          currentTotal,
          previousTotal,
          overallGrowth: Number(overallGrowth.toFixed(1)) // Round to 1 decimal place
        });
      };

      calculateComparison();
    };

    calculateData();
  }, [transactions, timeframe, statType]);

  const data = statType === 'expense'
    ? statisticsData[timeframe]
    : incomeStatisticsData[timeframe];

  // Chart colors
  const barChartColors = ['#FF6384', '#4BC0C0', '#FFCE56', '#36A2EB', '#9966FF', '#FF9F40'];

  const renderTimeframeButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        timeframe === value && styles.activeTimeframeButton
      ]}
      onPress={() => setTimeframe(value)}
    >
      <Text
        style={[
          styles.timeframeText,
          timeframe === value && styles.activeTimeframeText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatTypeButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.statTypeButton,
        statType === value && styles.activeStatTypeButton,
        { backgroundColor: statType === value
          ? value === 'expense' ? '#FF6384' : '#4BC0C0'
          : '#252525' }
      ]}
      onPress={() => setStatType(value)}
    >
      <Ionicons
        name={value === 'expense' ? 'trending-down' : 'trending-up'}
        size={18}
        color="#FFFFFF"
      />
      <Text style={styles.statTypeText}>{label}</Text>
    </TouchableOpacity>
  );

  const fetchSmartTip = async () => {
    try {
      setIsLoading(true);
      const response = await getSmartTip();
      setSmartTip(response);
    } catch (err) {
      console.error('Error fetching smart tip:', err);
      setError(err.message || 'Failed to load smart tip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screenPadding}>
            {/* Type Selector (Expense/Income) */}
            <View style={styles.statTypeSelector}>
              {renderStatTypeButton('Expenses', 'expense')}
              {renderStatTypeButton('Income', 'income')}
            </View>

            {/* Timeframe buttons */}
            <View style={styles.timeframeButtons}>
              {renderTimeframeButton('Weekly', 'weekly')}
              {renderTimeframeButton('Monthly', 'monthly')}
              {renderTimeframeButton('Yearly', 'yearly')}
            </View>

            {/* Overview Card with integrated heading */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>
                  {statType === 'expense' ? 'Expense Statistics' : 'Income Statistics'}
                </Text>
                <Ionicons
                  name="stats-chart"
                  size={24}
                  color={statType === 'expense' ? '#FF6384' : '#4BC0C0'}
                />
              </View>
              <Text style={styles.cardLabel}>
                {timeframe === 'weekly' ? 'This Week' : timeframe === 'monthly' ? 'This Month' : 'This Year'}
              </Text>
              <Text style={[
                styles.totalAmount,
                {color: statType === 'expense' ? '#FF6384' : '#4BC0C0'}
              ]}>
                ${totalAmount.toFixed(2)}
              </Text>
              <Text style={styles.totalLabel}>
                {statType === 'expense' ? 'Total Expenses' : 'Total Income'}
              </Text>

              {/* Adding improvement indicator */}
              <View style={styles.improvementContainer}>
                <Text style={[
                  styles.improvementText,
                  {
                    color: statType === 'expense'
                      ? (data.improvementPercentage > 0 ? '#4BC0C0' : '#FF6384')
                      : (data.growthPercentage > 0 ? '#4BC0C0' : '#FF6384')
                  }
                ]}>
                  {statType === 'expense'
                    ? `${data.improvementPercentage > 0 ? '↓' : '↑'} ${Math.abs(data.improvementPercentage).toFixed(1)}% from previous ${timeframe.slice(0, -2)}`
                    : `${data.growthPercentage > 0 ? '↑' : '↓'} ${Math.abs(data.growthPercentage).toFixed(1)}% from previous ${timeframe.slice(0, -2)}`
                  }
                </Text>
              </View>
            </View>

            {/* Trend Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {statType === 'expense' ? 'Spending Trend' : 'Income Trend'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {timeframe === 'weekly' ? 'Last 7 days' : timeframe === 'monthly' ? 'Last 4 weeks' : 'Last 12 months'}
                </Text>
              </View>

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[
                    styles.legendDot,
                    { backgroundColor: statType === 'expense' ? '#276EF1' : '#4BC0C0' }
                  ]} />
                  <Text style={styles.legendText}>
                    {statType === 'expense'
                      ? timeframe === 'weekly'
                        ? 'Daily Spending'
                        : timeframe === 'monthly'
                          ? 'Weekly Spending'
                          : 'Monthly Spending'
                      : timeframe === 'weekly'
                        ? 'Daily Income'
                        : timeframe === 'monthly'
                          ? 'Weekly Income'
                          : 'Monthly Income'
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <SimpleLineChart
                  data={lineChartData.datasets[0].data}
                  labels={lineChartData.labels}
                  width={width - 40}
                  height={220}
                />
              </View>
            </View>

            {/* Top Categories Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {statType === 'expense' ? 'Top Categories' : 'Income Categories'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {statType === 'expense'
                    ? 'Where you spend the most'
                    : 'Sources of your income'
                  }
                </Text>
              </View>

              {topCategories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={getCategoryIcon(category.name)} size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryNameRow}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${category.percentage}%`, backgroundColor: category.color }
                        ]}
                      />
                    </View>

                    <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}% of total</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Methods Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {statType === 'expense' ? 'Payment Methods' : 'Income Sources'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {statType === 'expense'
                    ? 'How you pay for expenses'
                    : 'Where your income comes from'
                  }
                </Text>
              </View>

              {paymentMethods.map((method, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: method.color }]}>
                    <Ionicons name={getPaymentMethodIcon(method.name)} size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryNameRow}>
                      <Text style={styles.categoryName}>{method.name}</Text>
                      <Text style={styles.categoryAmount}>${method.amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${method.percentage}%`, backgroundColor: method.color }
                        ]}
                      />
                    </View>

                    <Text style={styles.categoryPercentage}>{method.percentage.toFixed(1)}% of total</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Month-to-Month Comparison */}
            <View style={[styles.sectionCard, { padding: 0, overflow: 'hidden' }]}>
              <View style={{ padding: 15, paddingBottom: 10 }}>
                <Text style={styles.sectionTitle}>
                  {statType === 'expense' ? 'Spending Comparison' : 'Income Comparison'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {statType === 'expense'
                    ? 'How you\'re improving over time'
                    : 'How your income is changing'
                  }
                </Text>
              </View>

              <View>
                <MonthComparisonChart
                  data={comparisonData}
                  width={width}
                  isIncome={statType === 'income'}
                />
              </View>
            </View>

            {/* Tips Card */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={24} color="#FFCE56" />
                <Text style={styles.tipsTitle}>
                  {statType === 'expense' ? 'Smart Saving Tip' : 'Income Growth Tip'}
                </Text>
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFCE56" />
              ) : error ? (
                <Text style={[styles.tipsText, { color: '#FF6384' }]}>
                  {error}
                </Text>
              ) : (
                <Text style={styles.tipsText}>
                  {smartTip?.tips?.[0] || 'No tips available'}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  screenPadding: {
    padding: 10,
  },
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  timeframeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  activeTimeframeButton: {
    backgroundColor: '#276EF1',
  },
  timeframeText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  improvementContainer: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
  },
  sectionHeader: {
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
    marginBottom: 5,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#ffffff',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 0,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666666',
  },
  tipsCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFCE56',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 16,
    color: '#FFCE56',
    fontWeight: '600',
    marginLeft: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  statTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    padding: 4,
  },
  statTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  activeStatTypeButton: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statTypeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default StatisticsScreen;
