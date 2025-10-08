import CalendarDay from "@/components/calendarDay";
import { useTheme } from '@/contexts/theme-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  getDayProgress?: (date: string) => { completionRate: number } | null;
}

export default function Calendar({ selectedDate, onDateSelect, getDayProgress }: CalendarProps) {
  const { colors } = useTheme();
  const today = new Date();
  
  // Initialize with current month/year
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();// 0 is Sunday, 1 is Monday, etc.

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (day: number) => {
    if (day < 1 || day > 31) return '';
    return `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    }
  };

  const getProgressColor = (completionRate: number) => {
    if (completionRate === 1) return colors.success;
    if (completionRate >= 0.5) return colors.warning;
    if (completionRate > 0) return colors.error;
    return colors.border;
  };

  const renderDay = (day: number) => {
    if (day < 1 || day > 31) return null;
    const date = formatDate(day);
    const isSelected = date === selectedDate;
    const isToday = day === today.getDate() && displayMonth === today.getMonth() && displayYear === today.getFullYear();
    
    const progress = getDayProgress ? getDayProgress(date) : null;
    const progressColor = progress ? getProgressColor(progress.completionRate) : colors.border;

    return (
      <CalendarDay
        key={`day-${day}`}
        day={day}
        isSelected={isSelected}
        isToday={isToday}
        showProgress={!!progress}
        progressColor={progressColor}
        colors={colors}
        onPress={() => onDateSelect(date)}
      />
    );
  };

  const renderCalendar = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <CalendarDay
          key={`empty-${i}`}
          isEmpty
          colors={colors}
        />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDay(day));
    }

    // Empty cells for days after the last day of the month
    for (let i = days.length; i < 42; i++) {
      days.push(
        <CalendarDay
          key={`empty-${i}`}
          isEmpty
          colors={colors}
        />
      );
    }

    return days;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')} 
          style={styles.navButton}
          testID="prev-month-button"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.monthText, { color: colors.text }]}>
          {monthNames[displayMonth]} {displayYear}
        </Text>
        
        <TouchableOpacity 
          onPress={() => navigateMonth('next')} 
          style={styles.navButton}
          testID="next-month-button"
        >
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dayNamesRow}>
        {dayNames.map(dayName => (
          <Text key={dayName} style={[styles.dayNameText, { color: colors.textSecondary }]}>
            {dayName}
          </Text>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {renderCalendar()}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // Each day cell is 40px wide, so 7 columns = 280px, add some gap
    width: 7 * 40,
    alignSelf: 'center',
    rowGap: 4,
    columnGap: 3,
    minHeight: 6 * 40, // up to 6 weeks
  },
});