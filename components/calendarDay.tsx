import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CalendarDayProps = {
  day?: number;
  isEmpty?: boolean;
  isSelected?: boolean;
  isToday?: boolean;
  showProgress?: boolean;
  progressColor?: string;
  progressColorOff?: string;
  colors: {
    text: string;
    border: string;
    primary: string;
    textSecondary: string;
  };
  onPress?: () => void;
};

export default function CalendarDay ({
  day = 0,
  isEmpty = false,
  isSelected = false,
  isToday = false,
  showProgress = false,
  progressColor = 'transparent',
  progressColorOff = 'transparent',
  colors,
  onPress,
}: CalendarDayProps) {
  if (isEmpty) {
    return (
      <View style={[styles.dayButton, { borderColor: 'transparent' }]}>
        <Text style={[styles.dayText, { color: colors.textSecondary }]}></Text>
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[
        styles.dayButton,
        { borderColor: progressColor, backgroundColor: progressColorOff  },
        // isToday && { backgroundColor: colors.primary },
        // isToday && !isSelected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Day ${day}`}
    >
      <Text
        style={[
          styles.dayText,
          { color: colors.text },
          isToday && { fontWeight: 'bold' },
        ]}
      >
        {day}
      </Text>
      {/* {showProgress && (
        <View
          style={[
            styles.progressDot,
            { backgroundColor: progressColor },
          ]}
        />
      )} */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

