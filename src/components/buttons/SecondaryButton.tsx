import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export function SecondaryButton({ title, onPress }: Props) {
  const color = useThemeColor({}, 'secondary');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: color,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
