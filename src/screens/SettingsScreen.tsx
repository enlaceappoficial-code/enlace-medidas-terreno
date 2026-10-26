import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  
  const handleLimpiarDatos = () => {
    Alert.alert(
      'Limpiar Datos',
      '¿Estás seguro de que quieres borrar todos los proyectos de tu celular? Esto no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Borrar', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Éxito', 'Base de datos reiniciada. Vuelve a inicio e intenta crear de nuevo.');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>General</Text>
      
      <TouchableOpacity style={styles.optionRow}>
        <Text style={styles.optionText}>Exportar Base de Datos a JSON</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.optionRow} onPress={handleLimpiarDatos}>
        <Text style={[styles.optionText, {color: 'red'}]}>Limpiar Datos Locales</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Legal</Text>
      
      <TouchableOpacity style={styles.optionRow}>
        <Text style={styles.optionText}>Términos y Condiciones</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionRow}>
        <Text style={styles.optionText}>Política de Privacidad</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  optionRow: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  }
});
