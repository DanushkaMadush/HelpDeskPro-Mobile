import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text } from 'react-native';

type Props = {
  text: string;
};

export function Label({ text }: Props) {
  const color = useThemeColor({}, 'text');

  return <Text style={[styles.label, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
});