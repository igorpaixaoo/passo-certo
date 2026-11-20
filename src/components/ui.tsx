import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DIFFICULTY_INFO, type Difficulty } from '../data/types';
import { useTheme } from '../theme/SettingsContext';

/* ------------------------------------------------------------------ Texto */

type TextVariant = 'hero' | 'title' | 'large' | 'body' | 'small';

export function AppText({
  children,
  variant = 'body',
  muted,
  bold,
  color,
  style,
  center,
}: {
  children: ReactNode;
  variant?: TextVariant;
  muted?: boolean;
  bold?: boolean;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  const isHeading = variant === 'hero' || variant === 'title';
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      accessibilityRole={isHeading ? 'header' : undefined}
      style={[
        {
          fontSize: t.font[variant],
          lineHeight: Math.round(t.font[variant] * 1.35),
          color: color ?? (muted ? t.colors.textMuted : t.colors.text),
          fontWeight: bold || isHeading ? '700' : '400',
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ Tela */

export function Screen({
  children,
  title,
  back = true,
  right,
  scroll = true,
  footer,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const content = (
    <View style={{ padding: t.spacing(2.5), gap: t.spacing(2), paddingBottom: t.spacing(4) }}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background, paddingTop: insets.top }}>
      {(title || back || right) && (
        <View
          style={[
            styles.header,
            { borderBottomColor: t.colors.border, paddingHorizontal: t.spacing(2), gap: t.spacing(1.5) },
          ]}
        >
          {back && router.canGoBack() ? (
            <Button label="◀ Voltar" variant="ghost" compact onPress={() => router.back()} />
          ) : null}
          <View style={{ flex: 1 }}>
            {title ? (
              <AppText variant="large" bold>
                {title}
              </AppText>
            ) : null}
          </View>
          {right}
        </View>
      )}
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          {content}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {footer ? (
        <View
          style={{
            padding: t.spacing(2),
            paddingBottom: Math.max(insets.bottom, t.spacing(2)),
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.colors.border,
            backgroundColor: t.colors.surface,
            gap: t.spacing(1.5),
          }}
        >
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ Botão */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  compact,
  disabled,
  icon,
  accessibilityHint,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  compact?: boolean;
  disabled?: boolean;
  icon?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const c = t.colors;
  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: c.primary, fg: c.onPrimary, border: c.primary },
    secondary: { bg: 'transparent', fg: c.primary, border: c.primary },
    ghost: { bg: c.surfaceAlt, fg: c.text, border: 'transparent' },
    danger: { bg: c.danger, fg: c.onDanger, border: c.danger },
  };
  const p = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        {
          minHeight: compact ? 48 : t.touch,
          paddingHorizontal: compact ? t.spacing(1.75) : t.spacing(2.5),
          paddingVertical: t.spacing(1),
          borderRadius: compact ? 12 : t.radius,
          backgroundColor: p.bg,
          borderWidth: 2,
          borderColor: p.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: t.spacing(1),
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {icon ? (
        <Text maxFontSizeMultiplier={1.3} style={{ fontSize: compact ? t.font.body : t.font.large }}>
          {icon}
        </Text>
      ) : null}
      <Text
        maxFontSizeMultiplier={1.3}
        style={{ color: p.fg, fontSize: compact ? t.font.small : t.font.body, fontWeight: '700', textAlign: 'center' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Cartão */

export function Card({
  children,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius,
    borderWidth: 1.5,
    borderColor: t.colors.border,
    padding: t.spacing(2.25),
    gap: t.spacing(1),
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, { borderColor: pressed ? t.colors.primary : t.colors.border }, style]}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Dificuldade */

export function useDifficultyColor(d: Difficulty) {
  const { colors } = useTheme();
  return d === 'facil' ? colors.easy : d === 'medio' ? colors.medium : colors.hard;
}

/** Selo de dificuldade: cor + texto + marcadores (nunca só cor). */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const t = useTheme();
  const color = useDifficultyColor(difficulty);
  const info = DIFFICULTY_INFO[difficulty];
  const dots = '●'.repeat(info.level) + '○'.repeat(3 - info.level);
  return (
    <View
      accessible
      accessibilityLabel={`Dificuldade: ${info.label}`}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: color,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}
    >
      <Text maxFontSizeMultiplier={1.3} style={{ color: t.colors.onDifficulty, fontSize: t.font.small, letterSpacing: 1 }}>
        {dots}
      </Text>
      <Text maxFontSizeMultiplier={1.3} style={{ color: t.colors.onDifficulty, fontSize: t.font.small, fontWeight: '700' }}>
        {info.label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ Formulário */

export function TextField({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <AppText bold>{label}</AppText>
      {hint ? (
        <AppText variant="small" muted>
          {hint}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={t.colors.textMuted}
        maxFontSizeMultiplier={1.3}
        accessibilityLabel={label}
        {...props}
        style={[
          {
            minHeight: t.touch,
            borderWidth: 2,
            borderColor: t.colors.border,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: t.font.body,
            color: t.colors.text,
            backgroundColor: t.colors.surface,
            textAlignVertical: props.multiline ? 'top' : 'center',
          },
          props.style,
        ]}
      />
    </View>
  );
}

/** Grupo de opções grandes (tipo "rádio"). */
export function OptionGroup<T extends string | number>({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: { value: T; title: string; description?: string; preview?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  const t = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing(1) }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.description ? `${o.title}. ${o.description}` : o.title}
            style={{
              flexBasis: columns === 1 ? '100%' : columns === 2 ? '48%' : '31%',
              flexGrow: 1,
              minHeight: t.touch,
              borderRadius: 14,
              borderWidth: selected ? 3 : 1.5,
              borderColor: selected ? t.colors.primary : t.colors.border,
              backgroundColor: selected ? t.colors.surfaceAlt : t.colors.surface,
              paddingHorizontal: t.spacing(2),
              paddingVertical: t.spacing(1.25),
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.spacing(1.5),
            }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                borderWidth: 2.5,
                borderColor: selected ? t.colors.primary : t.colors.textMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selected ? (
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.colors.primary }} />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <AppText bold>{o.title}</AppText>
              {o.description ? (
                <AppText variant="small" muted>
                  {o.description}
                </AppText>
              ) : null}
            </View>
            {o.preview}
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <AppText variant="large" bold style={{ marginTop: 8 }}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
