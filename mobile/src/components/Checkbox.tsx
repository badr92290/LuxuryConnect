import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, fonts, radius, spacing } from "../theme/colors";

/** Même case à cocher que le site : cadre doré une fois activée. */
export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onChange}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.row, checked ? styles.rowActive : styles.rowIdle]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Svg width={11} height={11} viewBox="0 0 16 16" fill="none">
            <Path
              d="M3.5 8.2 6.5 11l6-7"
              stroke={colors.background}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  rowIdle: { borderColor: colors.hairline },
  rowActive: { borderColor: "rgba(201,168,118,0.5)", backgroundColor: "rgba(201,168,118,0.05)" },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.textMutedDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  boxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  label: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.text },
});
