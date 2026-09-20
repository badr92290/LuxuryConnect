import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, eyebrow, fonts, goldGradient, radius, spacing } from "../theme/colors";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type BadgeTone = "primary" | "muted" | "success" | "danger";

/* ─────────── Typographie ─────────── */

/** Titre de page : Fraunces, comme les `h1` du site. */
export function Title({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.title, style]}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.subtitle, style]}>
      {children}
    </Text>
  );
}

/** Petite capitale espacée qui coiffe les sections du site. */
export function SectionLabel({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.sectionLabel, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.body, style]}>
      {children}
    </Text>
  );
}

export function Muted({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.muted, style]}>
      {children}
    </Text>
  );
}

/** Mot-symbole « LuxuryConnect », Connect en Fraunces italique doré. */
export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <Text style={[styles.wordmark, { fontSize: size }]}>
      Luxury
      <Text style={[styles.wordmarkAccent, { fontSize: size }]}>Connect</Text>
    </Text>
  );
}

/* ─────────── Contrôles ─────────── */

export function Button({
  title,
  onPress,
  loading,
  variant = "primary",
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const inactive = disabled || loading;
  const textColor =
    variant === "primary" ? colors.background
    : variant === "danger" ? colors.background
    : variant === "ghost" ? colors.primary
    : colors.text;

  const label = loading ? (
    <ActivityIndicator color={textColor} size="small" />
  ) : (
    <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
  );

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={inactive}
        style={({ pressed }) => [
          styles.buttonShell,
          { opacity: inactive ? 0.4 : pressed ? 0.88 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {label}
        </LinearGradient>
      </Pressable>
    );
  }

  const skin: ViewStyle =
    variant === "danger"
      ? { backgroundColor: colors.danger, borderColor: colors.danger }
      : variant === "ghost"
        ? { backgroundColor: "transparent", borderColor: "transparent" }
        : { backgroundColor: "transparent", borderColor: colors.border };

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.buttonShell,
        styles.button,
        styles.bordered,
        skin,
        { opacity: inactive ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {label}
    </Pressable>
  );
}

export function Input({
  label,
  style,
  containerStyle,
  ...props
}: TextInputProps & { label?: string; containerStyle?: ViewStyle }) {
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMutedDark}
        {...props}
        style={[styles.input, style]}
      />
    </View>
  );
}

/** Enveloppe un contrôle non textuel (picker, sélecteur) avec le même label. */
export function Field({
  label,
  children,
  style,
}: {
  label?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      {children}
    </View>
  );
}

/* ─────────── Conteneurs ─────────── */

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { borderColor: colors.primary, opacity: 0.92 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Badge({ label, tone = "primary" }: { label: string; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, { bg: string; border: string; text: string }> = {
    primary: { bg: "rgba(201,168,118,0.12)", border: "rgba(201,168,118,0.25)", text: colors.gold200 },
    muted: { bg: colors.surfaceAlt, border: colors.border, text: colors.textMuted },
    success: { bg: "rgba(92,184,138,0.12)", border: "rgba(92,184,138,0.25)", text: colors.success },
    danger: { bg: "rgba(217,116,98,0.12)", border: "rgba(217,116,98,0.25)", text: colors.danger },
  };
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.badgeText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= full ? colors.primary : colors.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

/* ─────────── États ─────────── */

/** Bloc gris pulsé, équivalent du `Skeleton` scintillant du site. */
export function Skeleton({ style }: { style?: ViewStyle }) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <Animated.View style={[styles.skeleton, { opacity: pulse }, style]} />;
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.skelRow}>
            <Skeleton style={{ height: 14, flex: 1 }} />
            <Skeleton style={{ height: 20, width: 78, borderRadius: radius.full }} />
          </View>
          <Skeleton style={{ height: 11, width: "66%", marginTop: spacing.md }} />
          <Skeleton style={{ height: 11, width: "33%", marginTop: spacing.sm }} />
        </View>
      ))}
    </View>
  );
}

export function Spinner() {
  return (
    <View style={styles.spinner}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <Text style={styles.empty}>{message}</Text>;
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  sectionLabel: { ...eyebrow, color: colors.textMutedDark },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  muted: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted },

  wordmark: { fontFamily: fonts.display, color: colors.text, letterSpacing: 0.2 },
  wordmarkAccent: { fontFamily: fonts.displayItalic, color: colors.primary },

  buttonShell: { borderRadius: radius.md, overflow: "hidden" },
  button: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  bordered: { borderWidth: 1 },
  buttonText: { fontFamily: fonts.bodySemi, fontSize: 15, letterSpacing: 0.2 },

  fieldLabel: { ...eyebrow, color: colors.textMuted, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  badge: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: { ...eyebrow, fontSize: 10 },

  skeleton: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  skelRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },

  spinner: { paddingVertical: 64, alignItems: "center", justifyContent: "center" },
  empty: {
    fontFamily: fonts.body,
    paddingVertical: 64,
    textAlign: "center",
    fontSize: 14,
    color: colors.textMuted,
  },
  error: {
    fontFamily: fonts.body,
    marginBottom: spacing.md,
    fontSize: 14,
    color: colors.danger,
  },
});
