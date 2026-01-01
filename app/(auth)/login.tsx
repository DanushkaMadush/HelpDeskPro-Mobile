import { useThemeColor } from '@/hooks/use-theme-color';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { TertiaryButton } from '@/src/components/buttons/TertiaryButton';
import { InputPassword } from '@/src/components/inputs/InputPassword';
import { InputText } from '@/src/components/inputs/InputText';
import { Label } from '@/src/components/labels/Label';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const background = useThemeColor({}, 'background');

  const handleLogin = () => {
    console.log('Login pressed', { email, password });
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Form */}
      <View style={styles.form}>
        <Label text="Email" />
        <InputText
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
        />

        <View style={styles.spacer} />

        <Label text="Password" />
        <InputPassword
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
        />

        <View style={styles.spacerLarge} />

        <PrimaryButton title="Login" onPress={handleLogin} />

        <View style={styles.spacerSmall} />

        <TertiaryButton
          title="Forgot password?"
          onPress={() => console.log('Forgot password')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    gap: 4,
  },
  spacer: {
    height: 12,
  },
  spacerLarge: {
    height: 24,
  },
  spacerSmall: {
    height: 10,
  },
});