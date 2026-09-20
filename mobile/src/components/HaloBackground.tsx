import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function HaloBackground({ opacity = 1 }: { opacity?: number } = {}) {
  return (
    <View style={[styles.wrap, { opacity }]} pointerEvents="none">
      <View style={[styles.circle, styles.glow]} />
      <View style={[styles.circle, styles.ringOuter]} />
      <View style={[styles.circle, styles.ringMid]} />
      <View style={[styles.circle, styles.ringInner]} />
      <View style={styles.line} />
    </View>
  );
}

const SIZE = 420;

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderRadius: SIZE,
  },
  glow: {
    width: SIZE,
    height: SIZE,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  ringOuter: {
    width: SIZE - 40,
    height: SIZE - 40,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.2,
  },
  ringMid: {
    width: SIZE - 90,
    height: SIZE - 90,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.4,
  },
  ringInner: {
    width: SIZE - 120,
    height: SIZE - 120,
    borderWidth: 1,
    borderColor: colors.text,
    opacity: 0.18,
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
});
