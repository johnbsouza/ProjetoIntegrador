// src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
      {/* Os grupos (admin), (cliente) e (profissional) herdam o headerShown: false e geram os próprios */}
    </Stack>
  );
}