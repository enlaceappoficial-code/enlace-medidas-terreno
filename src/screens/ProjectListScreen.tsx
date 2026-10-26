import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getProjects, canCreateProject, getLicenseData, LicenseStatus } from '../store/storage';
import { Project } from '../store/models';
import LicenseModal from '../components/LicenseModal';

export default function ProjectListScreen({ navigation }: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [license, setLicense] = useState<LicenseStatus | null>(null);
  const [isLicenseModalVisible, setIsLicenseModalVisible] = useState(false);
  const [licenseReason, setLicenseReason] = useState<string>('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    loadData();
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const data = await getProjects();
    setProjects(JSON.parse(JSON.stringify(data)));
    const lic = await getLicenseData();
    setLicense(lic);
  };

  const handleCreatePress = async () => {
    const check = await canCreateProject();
    if (!check.allowed) {
      setLicenseReason('Has alcanzado el límite de 2 visitas del Modo Gratuito. Activa tu Plan Pro para crear visitas y proyectos ilimitados.');
      setIsLicenseModalVisible(true);
    } else {
      navigation.navigate('CreateProject');
    }
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

      {/* Barra de Estado de Plan */}
      <View style={styles.planBanner}>
        {license?.isPro ? (
          <View style={styles.proBadgeRow}>
            <Text style={styles.proBadgeText}>⭐ {license.planLabel}</Text>
            <Text style={styles.proSubText}>Visitas ilimitadas</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.freeBadgeRow} 
            onPress={() => {
              setLicenseReason('Activa tu Plan Pro para desbloquear visitas ilimitadas y exportación a JSON hacia el software de escritorio.');
              setIsLicenseModalVisible(true);
            }}
          >
            <Text style={styles.freeBadgeText}>🎁 Modo Gratis ({projects.length}/2 visitas)</Text>
            <Text style={styles.upgradeLink}>Activar Pro ⚡</Text>
          </TouchableOpacity>
        )}
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
                <Text style={styles.client}>👤 Cliente: {item.datosGenerales.cliente}</Text>
                <Text style={styles.date}>📅 Fecha: {item.datosGenerales.fecha}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleCreatePress}
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

      {/* Modal de Licencia Pro */}
      <LicenseModal
        visible={isLicenseModalVisible}
        onClose={() => setIsLicenseModalVisible(false)}
        reason={licenseReason}
        onActivated={(newLic) => {
          setLicense(newLic);
          loadData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  planBanner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  proBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#065f46',
    fontWeight: 'bold',
    fontSize: 13,
  },
  proSubText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
  },
  freeBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#9a3412',
    fontWeight: 'bold',
    fontSize: 13,
  },
  upgradeLink: {
    color: '#ea580c',
    fontWeight: 'bold',
    fontSize: 13,
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
    marginTop: 50,
  },
  watermark: {
    width: 300,
    height: 300,
    opacity: 0.1,
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
    bottom: 110,
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
