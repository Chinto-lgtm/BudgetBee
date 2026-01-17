import { Stack } from 'expo-router';
import { FamilyProvider } from '../src/contexts/FamilyContext';

export default function RootLayout() {
  return (
    <FamilyProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* This will automatically look for app/index.jsx */}
        <Stack.Screen name="index" />
      </Stack>
    </FamilyProvider>
  );
}