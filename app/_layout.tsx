import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Instrução para não esconder a splash automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appPronto, setAppPronto] = useState(false);

  useEffect(() => {
    async function preparar() {
      try {
        // Simula um carregamento de 3 segundos para o AR Bank
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppPronto(true);
      }
    }

    preparar();
  }, []);

  useEffect(() => {
    if (appPronto) {
      // Esconde a splash apenas quando o estado appPronto for true
      SplashScreen.hideAsync();
    }
  }, [appPronto]);

  // Se o app não estiver pronto, retornamos null (a Splash Screen fica visível)
  if (!appPronto) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}