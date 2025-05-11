import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const lineColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)";
  const textColor = isDark ? "#CCCCCC" : "#666666";
  const bubbleBg = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={[styles.line, { backgroundColor: lineColor }]} />
        <View style={[styles.dateBubble, { backgroundColor: bubbleBg }]}>
          <ThemedText style={[styles.dateText, { color: textColor }]}>
            {date}
          </ThemedText>
        </View>
        <View style={[styles.line, { backgroundColor: lineColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%", // take full screen width
    alignItems: "center", // center row itself if parent is wider
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%", // ensure the two lines can flex evenly
  },
  line: {
    flex: 1, // each line takes remaining space equally
    height: 1,
  },
  dateBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 8, // gap between bubble and lines
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
