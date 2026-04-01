import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function InputPassword({ value, onChangeText, placeholder }: Props) {
  const [secure, setSecure] = useState(true);

  const background = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'secondary');

  return (
    <View style={[styles.container, { backgroundColor: background, borderColor: border }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secure}
        style={[styles.input, { color: text }]}
      />
      <Pressable onPress={() => setSecure(!secure)}>
        <Text style={[styles.toggle, { color: secondary }]}>
          {secure ? 'Show' : 'Hide'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
  },
  toggle: {
    fontSize: 13,
    fontWeight: '500',
  },
});