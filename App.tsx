import React from 'react';
import { Image, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/theme/colors';

// Navegadores y Pantallas
import MainTabs from './src/navigation/MainTabs';
import CreateProjectScreen from './src/screens/CreateProjectScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import ToolsExpressCalcScreen from './src/screens/ToolsExpressCalcScreen';
import ToolsStandardCalcScreen from './src/screens/ToolsStandardCalcScreen';
import ToolsNotesScreen from './src/screens/ToolsNotesScreen';
import ToolsGalleryScreen from './src/screens/ToolsGalleryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer
      documentTitle={{
        formatter: (options, route) =>
          `${options?.title ?? route?.name ?? 'Inicio'} · ECP Medidas de Terreno`,
      }}
    >
      <StatusBar style="light" backgroundColor={colors.primary} />
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <>
              <Image 
                source={require('./assets/logo sin fondo.png')} 
                style={{ width: 40, height: 40, marginRight: 12 }} 
                resizeMode="contain" 
              />
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Text style={{ fontSize: 24 }}>⚙️</Text>
              </TouchableOpacity>
            </>
          ),
        })}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ title: 'Proyectos ECP', headerShadowVisible: false }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Configuración' }} 
        />

        <Stack.Screen 
          name="CreateProject" 
          component={CreateProjectScreen} 
          options={{ title: 'Nueva Visita' }} 
        />
        <Stack.Screen 
          name="ProjectDetail" 
          component={ProjectDetailScreen} 
          options={{ title: 'Detalle de Visita' }} 
        />
        <Stack.Screen 
          name="Calculator" 
          component={CalculatorScreen} 
          options={{ title: 'Calculadora' }} 
        />

        {/* Herramientas */}
        <Stack.Screen 
          name="ToolsExpressCalc" 
          component={ToolsExpressCalcScreen} 
          options={{ title: 'Calculadora Exprés' }} 
        />
        <Stack.Screen 
          name="ToolsStandardCalc" 
          component={ToolsStandardCalcScreen} 
          options={{ title: 'Calculadora Clásica' }} 
        />
        <Stack.Screen 
          name="ToolsLayoutCalc" 
          component={require('./src/screens/ToolsLayoutCalcScreen').default} 
          options={{ title: 'Trazado y Pendientes' }} 
        />
        <Stack.Screen 
          name="ToolsNotes" 
          component={ToolsNotesScreen} 
          options={{ title: 'Block de Notas' }} 
        />
        <Stack.Screen 
          name="ToolsGallery" 
          component={ToolsGalleryScreen} 
          options={{ title: 'Tus Referencias' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
