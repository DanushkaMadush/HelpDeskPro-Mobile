import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, disabled }: Props) {
  const background = useThemeColor({}, 'primary');
  const text = useThemeColor({ light: '#FFFFFF', dark: '#FFFFFF' }, 'text');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { color: text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});