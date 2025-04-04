import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';

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

// Simple Line Chart Component
const SimpleLineChart = ({ data, labels, width, height }) => {
  const [activePointIndex, setActivePointIndex] = useState(null);
  
  // MUCH more aggressive margins to absolutely guarantee all labels fit
  const paddingLeft = 50; 
  const paddingRight = 25; 
  const paddingTop = 40;
  const paddingBottom = 30;
  
  // Calculate available space for the chart
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Safe max value calculation
  const dataMax = Math.max(...data);
  const maxValue = Math.ceil(dataMax * 1.2); // Simple 20% buffer
  
  // Function to convert data point to coordinates
  const getX = (index) => paddingLeft + (index * chartWidth) / (data.length - 1);
  const getY = (value) => paddingTop + chartHeight - (value / maxValue) * chartHeight;
  
  // Function to find closest point to a given x coordinate - safely handle out of bounds
  const findClosestPoint = (x) => {
    // Ensure x is within chart bounds
    const safeX = Math.max(paddingLeft, Math.min(paddingLeft + chartWidth, x));
    
    // Convert the x coordinate to a chart position
    const chartX = safeX - paddingLeft;
    
    // Calculate the position of each data point
    const distances = data.map((_, index) => {
      const pointX = (index * chartWidth) / (data.length - 1);
      return Math.abs(pointX - chartX);
    });
    
    // Find the index of the closest point
    return distances.indexOf(Math.min(...distances));
  };
  
  // Create pan responder for drag interaction, safely handling events
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      try {
        const { locationX } = evt.nativeEvent;
        const closestIndex = findClosestPoint(locationX);
        if (closestIndex >= 0 && closestIndex < data.length) {
          setActivePointIndex(closestIndex);
        }
      } catch (error) {
        console.log('Chart interaction error:', error);
      }
    },
    onPanResponderMove: (evt) => {
      try {
        const { locationX } = evt.nativeEvent;
        const closestIndex = findClosestPoint(locationX);
        if (closestIndex >= 0 && closestIndex < data.length) {
          setActivePointIndex(closestIndex);
        }
      } catch (error) {
        console.log('Chart interaction error:', error);
      }
    },
    onPanResponderRelease: () => {
      // Keep the tooltip visible after release
    }
  }), [data, chartWidth, paddingLeft]);
  
  // Generate path for the line
  let linePath = '';
  data.forEach((value, index) => {
    const x = getX(index);
    const y = getY(value);
    if (index === 0) {
      linePath += `M ${x} ${y}`;
    } else {
      linePath += ` L ${x} ${y}`;
    }
  });
  
  // Handle point press (still keep this for tap functionality)
  const handlePointPress = (index) => {
    setActivePointIndex(prev => prev === index ? null : index);
  };
  
  // Generate Y-axis labels - simplified for guaranteed visibility
  const generateYLabels = () => {
    // Use exactly 4 labels - 0, 1/3, 2/3, and max
    return [0, Math.round(maxValue/3), Math.round(maxValue*2/3), maxValue];
  };
  
  const yAxisLabels = generateYLabels();
  
  // Format value with appropriate suffix
  const formatValue = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };
  
  // Safely render chart content
  const renderChart = () => {
    try {
      return (
        <Svg width={width} height={height}>
          {/* Chart background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#1a1a1a"
            rx={12}
          />
          
          {/* Y-axis title - moved lower to ensure visibility */}
          <SvgText
            x={6}
            y={paddingTop - 20}
            fill="#999999"
            fontSize="9"
            textAnchor="start"
          >
            Amount ($)
          </SvgText>
          
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
          
          {/* Y-axis labels - now with guaranteed spacing */}
          {yAxisLabels.map((value, i) => (
            <SvgText
              key={`y-label-${i}`}
              x={paddingLeft - 10}
              y={getY(value) + 3}
              fill="#999999"
              fontSize="9"
              fontWeight="500"
              textAnchor="end"
            >
              {formatValue(value)}
            </SvgText>
          ))}
          
          {/* Area under the curve */}
          <Path
            d={`${linePath} L ${getX(data.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`}
            fill="#276EF1"
            fillOpacity="0.1"
          />
          
          {/* Line */}
          <Path
            d={linePath}
            stroke="#276EF1"
            strokeWidth="2.5"
            fill="none"
          />
          
          {/* Visual indicator line for active point */}
          {activePointIndex !== null && (
            <Line
              x1={getX(activePointIndex)}
              y1={paddingTop}
              x2={getX(activePointIndex)}
              y2={paddingTop + chartHeight}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              strokeDasharray="3, 3"
            />
          )}
          
          {/* Visible dots */}
          {data.map((value, index) => (
            <Circle
              key={`dot-${index}`}
              cx={getX(index)}
              cy={getY(value)}
              r={activePointIndex === index ? "6" : "3.5"}
              fill={activePointIndex === index ? "#276EF1" : "#1a1a1a"}
              stroke="#276EF1"
              strokeWidth="2"
            />
          ))}
          
          {/* Better aligned X-axis label background for yearly view */}
          {labels.length >= 10 && (
            <Rect
              x={paddingLeft - 5}
              y={paddingTop + chartHeight + 2}
              width={chartWidth + 10}
              height={25}
              fill="#1a1a1a"
            />
          )}
          
          {/* Perfectly aligned X-axis labels */}
          {labels.map((label, index) => {
            // Calculate precise position
            const x = getX(index);
            
            if (labels.length >= 10) {
              // Annual view - show all months with better alignment
              return (
                <G key={`label-container-${index}`}>
                  {/* Small tick mark to show exact position */}
                  <Line
                    x1={x}
                    y1={paddingTop + chartHeight}
                    x2={x}
                    y2={paddingTop + chartHeight + 3}
                    stroke={activePointIndex === index ? "#fff" : "#555"}
                    strokeWidth="1"
                  />
                  <SvgText
                    key={`label-${index}`}
                    x={x}
                    y={paddingTop + chartHeight + 15}
                    fill={activePointIndex === index ? "#fff" : "#999999"}
                    fontSize="8"
                    fontWeight={activePointIndex === index ? "bold" : "normal"}
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            } else {
              // Weekly/Monthly view - standard horizontal labels
              return (
                <G key={`label-container-${index}`}>
                  {/* Small tick mark to show exact position */}
                  <Line
                    x1={x}
                    y1={paddingTop + chartHeight}
                    x2={x}
                    y2={paddingTop + chartHeight + 3}
                    stroke={activePointIndex === index ? "#fff" : "#555"}
                    strokeWidth="1"
                  />
                  <SvgText
                    key={`label-${index}`}
                    x={x}
                    y={paddingTop + chartHeight + 15}
                    fill={activePointIndex === index ? "#fff" : "#999999"}
                    fontSize="9"
                    fontWeight={activePointIndex === index ? "bold" : "normal"}
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            }
          })}
          
          {/* HUGE Touch target areas */}
          {data.map((value, index) => (
            <Circle
              key={`touch-${index}`}
              cx={getX(index)}
              cy={getY(value)}
              r="25"
              fill="transparent"
              onPress={() => handlePointPress(index)}
            />
          ))}
          
          {/* Active point value display */}
          {activePointIndex !== null && activePointIndex >= 0 && activePointIndex < data.length && (
            <G>
              <Rect
                x={getX(activePointIndex) - 35}
                y={getY(data[activePointIndex]) - 25}
                width="70"
                height="18"
                rx="4"
                fill="#333"
              />
              <SvgText
                x={getX(activePointIndex) - 23}
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
const MonthComparisonChart = ({ data, width, height }) => {
  const { currentMonth, previousMonth, categories } = data;
  
  // Calculate overall totals and improvement
  const currentTotal = categories.reduce((sum, cat) => sum + cat.current, 0);
  const previousTotal = categories.reduce((sum, cat) => sum + cat.previous, 0);
  const overallChange = ((previousTotal - currentTotal) / previousTotal) * 100;
  const isOverallImprovement = overallChange > 0;
  
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
        {/* Changed layout - all elements stacked vertically for clarity */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>Overall Improvement</Text>
          <View style={{ 
            backgroundColor: isOverallImprovement ? 'rgba(75, 192, 192, 0.1)' : 'rgba(255, 99, 132, 0.1)',
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: isOverallImprovement ? '#4BC0C0' : '#FF6384',
            width: '100%',
          }}>
            <Text style={{ 
              color: isOverallImprovement ? '#4BC0C0' : '#FF6384', 
              fontSize: 18, 
              fontWeight: 'bold'
            }}>
              {isOverallImprovement ? '↓' : '↑'} {Math.abs(overallChange).toFixed(1)}% from previous period
            </Text>
          </View>
        </View>
        
        {/* Amounts side by side with PLENTY of space */}
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
      
      {/* Category Cards - COMPLETELY REDESIGNED */}
      <ScrollView 
        style={{ maxHeight: 350, paddingHorizontal: 15, marginBottom: 15 }} 
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => {
          const isImprovement = category.improvement > 0;
          const changeColor = isImprovement ? '#4BC0C0' : '#FF6384';
          const improvementText = isImprovement ? 'less than' : 'more than';
          
          return (
            <View key={index} style={{ 
              backgroundColor: '#181818',
              borderRadius: 10,
              padding: 15,
              marginBottom: 12,
              borderLeftWidth: 4,
              borderLeftColor: changeColor,
            }}>
              {/* Category name alone on top */}
              <Text style={{ 
                color: '#fff', 
                fontSize: 16, 
                fontWeight: 'bold', 
                marginBottom: 12
              }}>
                {category.name}
              </Text>
              
              {/* SEPARATED comparison row with improvement bar */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <View style={{ width: '46%' }}>
                  <Text style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Current</Text>
                  <Text style={{ color: '#4BC0C0', fontSize: 18, fontWeight: '600' }}>
                    ${category.current.toFixed(0)}
                  </Text>
                </View>
                
                <View style={{ width: '46%' }}>
                  <Text style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Previous</Text>
                  <Text style={{ color: '#FF6384', fontSize: 18, fontWeight: '600' }}>
                    ${category.previous.toFixed(0)}
                  </Text>
                </View>
              </View>
              
              {/* Change percentage on its own row */}
              <View style={{ 
                backgroundColor: isImprovement ? 'rgba(75, 192, 192, 0.1)' : 'rgba(255, 99, 132, 0.1)',
                padding: 10,
                borderRadius: 6,
              }}>
                <Text style={{ color: changeColor, fontWeight: '500' }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {isImprovement ? '↓' : '↑'} {Math.abs(category.improvement).toFixed(1)}%
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

const StatisticsScreen = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const data = statisticsData[timeframe];

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.screenPadding}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <Ionicons name="stats-chart" size={24} color="#276EF1" />
            </View>
            
            <View style={styles.timeframeButtons}>
              {renderTimeframeButton('Weekly', 'weekly')}
              {renderTimeframeButton('Monthly', 'monthly')}
              {renderTimeframeButton('Yearly', 'yearly')}
            </View>
          </View>
          
          {/* Overview Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              {timeframe === 'weekly' ? 'This Week' : timeframe === 'monthly' ? 'This Month' : 'This Year'}
            </Text>
            <Text style={styles.totalAmount}>${data.totalSpent.toFixed(2)}</Text>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            
            {/* Adding improvement indicator */}
            <View style={styles.improvementContainer}>
              <Text style={[
                styles.improvementText, 
                {color: data.improvementPercentage > 0 ? '#4BC0C0' : '#FF6384'}
              ]}>
                {data.improvementPercentage > 0 ? '↓' : '↑'} {Math.abs(data.improvementPercentage).toFixed(1)}% from previous {timeframe.slice(0, -2)}
              </Text>
            </View>
          </View>
          
          {/* Spending Trend Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending Trend</Text>
              <Text style={styles.sectionSubtitle}>
                {timeframe === 'weekly' ? 'Last 7 days' : timeframe === 'monthly' ? 'Last 4 weeks' : 'Last 12 months'}
              </Text>
            </View>
            
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#276EF1' }]} />
                <Text style={styles.legendText}>
                  {timeframe === 'weekly' 
                    ? 'Daily Spending' 
                    : timeframe === 'monthly' 
                      ? 'Weekly Spending' 
                      : 'Monthly Spending'}
                </Text>
              </View>
            </View>
            
            <View style={styles.chartContainer}>
              <SimpleLineChart
                data={data.trend.datasets[0].data}
                labels={data.trend.labels}
                width={width - 40}
                height={220}
              />
            </View>
          </View>
          
          {/* Top Categories Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Categories</Text>
              <Text style={styles.sectionSubtitle}>Where you spend the most</Text>
            </View>
            
            {data.topCategories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={20} color="#FFFFFF" />
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
                  
                  <Text style={styles.categoryPercentage}>{category.percentage}% of total</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Payment Methods */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              <Text style={styles.sectionSubtitle}>How you pay for expenses</Text>
            </View>
            
            {data.paymentMethods.map((method, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, { backgroundColor: method.color }]}>
                  <Ionicons name={method.icon} size={20} color="#FFFFFF" />
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
                  
                  <Text style={styles.categoryPercentage}>{method.percentage}% of total</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Month-to-Month Comparison - COMPLETELY OVERHAULED */}
          <View style={[styles.sectionCard, { padding: 0, overflow: 'hidden' }]}>
            <View style={{ padding: 15, paddingBottom: 10 }}>
              <Text style={styles.sectionTitle}>Spending Comparison</Text>
              <Text style={styles.sectionSubtitle}>How you're improving over time</Text>
            </View>
            
            <View>
              <MonthComparisonChart
                data={data.monthComparison}
                width={width}
              />
            </View>
          </View>
          
          {/* Money-Saving Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#FFCE56" />
              <Text style={styles.tipsTitle}>Smart Saving Tip</Text>
            </View>
            <Text style={styles.tipsText}>
              {timeframe === 'weekly' 
                ? "Try meal prepping on weekends to reduce food expenses on weekdays!"
                : timeframe === 'monthly'
                ? "Consider reviewing your subscription services - you might be paying for services you rarely use."
                : "Set up automatic transfers to a savings account to build your emergency fund over the year."}
            </Text>
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
  headerContainer: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTimeframeButton: {
    backgroundColor: '#276EF1',
  },
  timeframeText: {
    color: '#666666',
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
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
    marginBottom: 20,
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
    marginVertical: 8,
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
    marginBottom: 10,
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
    marginBottom: 20,
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
});

export default StatisticsScreen; 