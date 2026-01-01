import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export function TertiaryButton({ title, onPress }: Props) {
  const color = useThemeColor({}, 'secondary');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Text style={[styles.text, { color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.6,
  },
});