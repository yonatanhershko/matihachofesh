import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { ToastProvider } from 'react-native-toast-notifications';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@shopify/restyle';
import { lightTheme, darkTheme } from './theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <ToastProvider>
        <View style={{ flex: 1 }}>
          <Toast />
          <Slot />
        </View>
      </ToastProvider>
    </ThemeProvider>
  );
}