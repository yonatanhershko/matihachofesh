import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { ToastProvider } from 'react-native-toast-notifications';

export default function RootLayout() {



  // if (!fontsLoaded) {
  //   return <LoadingIndicator />;
  // }


  return (
    <ToastProvider>
      <View style={{ flex: 1 }}>
        <Toast />
        <Slot />
      </View>
    </ToastProvider>
  );
}