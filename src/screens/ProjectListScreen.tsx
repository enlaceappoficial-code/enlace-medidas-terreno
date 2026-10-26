import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getProjects } from '../store/storage';
import { Project } from '../store/models';

export default function ProjectListScreen({ navigation }: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProjects();
    });

    // Cargar también la primera vez
    loadProjects();

    return unsubscribe;
  }, [navigation]);

  const loadProjects = async () => {
    const data = await getProjects();
    // Clonar para forzar re-render
    setProjects(JSON.parse(JSON.stringify(data)));
  };

  const openWebsite = () => {
    Linking.openURL('https://redenlace.cl/constructor-pro');
  };

  return (
    <View style={styles.container}>
      {/* Marca de agua de fondo */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Image 
          source={require('../../assets/logo sin fondo.png')} 
          style={styles.watermark} 
          resizeMode="contain" 
        />
      </View>

      <View style={styles.listContainer}>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tienes visitas registradas.</Text>
            <Text style={styles.emptyStateSub}>Presiona el botón + para crear una.</Text>
          </View>
        ) : (
          <FlatList 
            data={projects}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('ProjectDetail', { project: item })}
              >
                <Text style={styles.title}>{item.datosGenerales.descripcionObra || 'Sin descripción'}</Text>
                <Text style={styles.client}>Cliente: {item.datosGenerales.cliente}</Text>
                <Text style={styles.date}>Fecha: {item.datosGenerales.fecha}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateProject')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]} 
        onPress={openWebsite}
      >
        <Text style={styles.bottomBarText}>Enlace Constructor Pro — Software de Presupuestos</Text>
        <Text style={styles.bottomBarLink}>redenlace.cl/constructor-pro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Lo bajamos un poco hacia el centro visual
  },
  watermark: {
    width: 300,
    height: 300,
    opacity: 0.1, // Aumentado ligeramente para que sea visible
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyStateSub: {
    color: colors.textLight,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  client: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 4,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 110, // Subido más arriba para no chocar con la barra
    right: 24,
    backgroundColor: colors.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },
  bottomBar: {
    backgroundColor: colors.primary,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomBarLink: {
    color: colors.secondary,
    fontSize: 12,
    marginTop: 2,
  }
});
