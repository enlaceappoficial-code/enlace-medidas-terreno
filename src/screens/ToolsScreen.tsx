import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

export default function ToolsScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tus Herramientas de Terreno</Text>
      
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ToolsExpressCalc')}>
          <Text style={styles.icon}>⚡</Text>
          <Text style={styles.title}>Calculadora Exprés</Text>
          <Text style={styles.desc}>Volumen, m2, H20, Estuco y más</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ToolsStandardCalc')}>
          <Text style={styles.icon}>🔢</Text>
          <Text style={styles.title}>Calculadora Clásica</Text>
          <Text style={styles.desc}>Calculadora estándar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ToolsLayoutCalc')}>
          <Text style={styles.icon}>📏</Text>
          <Text style={styles.title}>Trazado y Conversor</Text>
          <Text style={styles.desc}>Escuadras, Pendientes y Unidades</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ToolsNotes')}>
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.title}>Block de Notas</Text>
          <Text style={styles.desc}>Hojas de apuntes rápidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { width: '100%' }]} onPress={() => navigation.navigate('ToolsGallery')}>
          <Text style={styles.icon}>🖼️</Text>
          <Text style={styles.title}>Galería de Referencias</Text>
          <Text style={styles.desc}>Guarda fotos por carpetas (Trabajos terminados, Ideas, etc.)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  icon: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  }
});
