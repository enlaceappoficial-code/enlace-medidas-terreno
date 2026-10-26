import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../theme/colors';

// Pantallas
import ProjectListScreen from '../screens/ProjectListScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ToolsScreen from '../screens/ToolsScreen';

const Tab = createMaterialTopTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        // Estilo del indicador tipo carpeta (ocupa todo el fondo de la pestaña activa)
        tabBarIndicatorStyle: { 
          backgroundColor: colors.background, 
          height: '100%',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderTopWidth: 4,
          borderTopColor: colors.secondary, // El distintivo naranja de ECP
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderLeftColor: colors.border,
          borderRightColor: colors.border,
          borderBottomWidth: 0,
        },
        tabBarStyle: { 
          backgroundColor: '#E2E8F0', // Fondo un poco más gris para resaltar la carpeta blanca
          elevation: 0, 
          shadowOpacity: 0,
          paddingTop: 8,
          paddingHorizontal: 8,
        },
        tabBarItemStyle: {
          marginHorizontal: 2,
        },
        tabBarLabelStyle: { 
          fontWeight: 'bold', 
          fontSize: 11, // Letra más pequeña
          textTransform: 'none', // Sin mayúsculas forzadas para ahorrar espacio
        },
      }}
    >
      <Tab.Screen name="Visitas" component={ProjectListScreen} />
      <Tab.Screen name="Clientes" component={ClientsScreen} />
      <Tab.Screen name="Herramientas" component={ToolsScreen} />
    </Tab.Navigator>
  );
}
