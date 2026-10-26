import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { getLicenseData, removeLicense, LicenseStatus } from '../store/storage';
import LicenseModal from '../components/LicenseModal';

export default function SettingsScreen() {
  const [license, setLicense] = useState<LicenseStatus | null>(null);
  const [isLicenseModalVisible, setIsLicenseModalVisible] = useState(false);

  useEffect(() => {
    loadLicense();
  }, []);

  const loadLicense = async () => {
    const lic = await getLicenseData();
    setLicense(lic);
  };

  const handleRemoveLicense = () => {
    Alert.alert(
      'Desactivar Licencia',
      '¿Deseas volver al Modo Gratuito en este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Desactivar',
          style: 'destructive',
          onPress: async () => {
            await removeLicense();
            await loadLicense();
            Alert.alert('Desactivada', 'La app ha vuelto al Modo Gratuito.');
          }
        }
      ]
    );
  };

  const handleOpenWeb = () => {
    Linking.openURL('https://redenlace.cl/constructor-pro');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* SECCIÓN DE PLAN Y LICENCIA */}
      <Text style={styles.sectionTitle}>TU PLAN Y LICENCIA</Text>

      {license?.isPro ? (
        <View style={styles.proCard}>
          <View style={styles.proHeader}>
            <Text style={styles.proBadge}>⭐ {license.planLabel.toUpperCase()}</Text>
            <Text style={styles.proStatusText}>ACTIVO</Text>
          </View>

          <Text style={styles.proDesc}>
            ¡Todas las funciones están desbloqueadas! Visitas ilimitadas, clientes y exportación a JSON directa para el software de escritorio.
          </Text>

          <View style={styles.licDetailBox}>
            <Text style={styles.licDetailLabel}>Vencimiento:</Text>
            <Text style={styles.licDetailValue}>{license.fechaVence || 'Sin vencimiento'}</Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={styles.changeLicBtn} 
              onPress={() => setIsLicenseModalVisible(true)}
            >
              <Text style={styles.changeLicText}>Cambiar Licencia</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.removeLicBtn} 
              onPress={handleRemoveLicense}
            >
              <Text style={styles.removeLicText}>Desactivar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.freeCard}>
          <View style={styles.freeHeader}>
            <Text style={styles.freeBadge}>🎁 MODO GRATUITO (PRUEBA)</Text>
          </View>

          <Text style={styles.freeDesc}>
            Estás usando la versión de demostración. Puedes registrar hasta 2 visitas técnicas. La exportación a JSON para escritorio está reservada para usuarios Pro.
          </Text>

          <TouchableOpacity 
            style={styles.activateBtn} 
            onPress={() => setIsLicenseModalVisible(true)}
          >
            <Text style={styles.activateBtnText}>⚡ Ingresar Código de Activación</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buyBtn} 
            onPress={handleOpenWeb}
          >
            <Text style={styles.buyBtnText}>🌐 Adquirir Plan Pro en redenlace.cl</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SECCIÓN GENERAL */}
      <Text style={styles.sectionTitle}>SOPORTE Y HERRAMIENTAS</Text>

      <TouchableOpacity style={styles.optionRow} onPress={handleOpenWeb}>
        <Text style={styles.optionText}>🌐 Sitio Oficial Enlace Constructor Pro</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionRow} 
        onPress={() => Linking.openURL('https://wa.me/56912345678?text=Hola,%20necesito%20soporte%20con%20ECP%20Medidas')}
      >
        <Text style={styles.optionText}>💬 Soporte por WhatsApp</Text>
      </TouchableOpacity>

      {/* SECCIÓN LEGAL */}
      <Text style={styles.sectionTitle}>LEGAL</Text>

      <TouchableOpacity 
        style={styles.optionRow}
        onPress={() => Alert.alert('Términos', 'Uso profesional destinado al cálculo y levantamiento métrico para obras y construcción.')}
      >
        <Text style={styles.optionText}>Términos de Servicio</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionRow}
        onPress={() => Alert.alert('Privacidad', 'Todos tus datos, clientes y mediciones se guardan de forma local en tu dispositivo de forma confidencial.')}
      >
        <Text style={styles.optionText}>Política de Privacidad</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        ECP Medidas de Terreno v1.2.0{'\n'}
        Red Enlace · Soluciones Digitales
      </Text>

      {/* MODAL DE LICENCIA */}
      <LicenseModal
        visible={isLicenseModalVisible}
        onClose={() => setIsLicenseModalVisible(false)}
        onActivated={(newLic) => {
          setLicense(newLic);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  proCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  proHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  proBadge: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proStatusText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  proDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14,
  },
  licDetailBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  licDetailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  licDetailValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  changeLicBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  changeLicText: {
    color: '#334155',
    fontWeight: 'bold',
    fontSize: 13,
  },
  removeLicBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  removeLicText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  freeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  freeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  freeBadge: {
    backgroundColor: '#fff7ed',
    color: '#9a3412',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  activateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  activateBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyBtn: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#ea580c',
    fontSize: 13,
    fontWeight: 'bold',
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
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 30,
    lineHeight: 18,
  },
});
