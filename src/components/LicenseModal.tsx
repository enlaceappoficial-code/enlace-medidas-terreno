import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Linking, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { saveLicenseKey, LicenseStatus } from '../store/storage';

interface LicenseModalProps {
  visible: boolean;
  onClose: () => void;
  onActivated?: (data: LicenseStatus) => void;
  reason?: string;
}

export default function LicenseModal({ visible, onClose, onActivated, reason }: LicenseModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [rutInput, setRutInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!keyInput.trim()) {
      Alert.alert('Código Requerido', 'Por favor ingresa tu código de licencia ECP.');
      return;
    }

    setLoading(true);
    const res = await saveLicenseKey(keyInput.trim(), rutInput.trim() || null);
    setLoading(false);

    if (res.success && res.data) {
      Alert.alert('¡Felicitaciones! 🎉', res.message);
      setKeyInput('');
      setRutInput('');
      onActivated?.(res.data);
      onClose();
    } else {
      Alert.alert('No se pudo activar', res.message);
    }
  };

  const handleOpenWeb = () => {
    Linking.openURL('https://redenlace.cl/constructor-pro');
  };

  const handleOpenWhatsApp = () => {
    const msg = encodeURIComponent('Hola! Deseo adquirir mi licencia de Enlace Constructor Pro para la app de medidas.');
    Linking.openURL(`https://wa.me/56912345678?text=${msg}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Encabezado */}
            <View style={styles.header}>
              <Text style={styles.icon}>🔐</Text>
              <Text style={styles.title}>Activar Plan Pro</Text>
              <Text style={styles.brand}>ENLACE CONSTRUCTOR PRO</Text>
            </View>

            {/* Motivo del aviso */}
            {reason ? (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>⚠️ {reason}</Text>
              </View>
            ) : null}

            {/* Beneficios */}
            <View style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>Con tu Licencia Pro obtienes:</Text>
              <Text style={styles.benefitItem}>✔️ <Text style={{fontWeight:'bold'}}>Visitas y proyectos ilimitados</Text> en terreno.</Text>
              <Text style={styles.benefitItem}>✔️ <Text style={{fontWeight:'bold'}}>Exportar a JSON</Text> directo a tu PC de escritorio.</Text>
              <Text style={styles.benefitItem}>✔️ <Text style={{fontWeight:'bold'}}>Clientes y contactos</Text> sin restricciones.</Text>
              <Text style={styles.benefitItem}>✔️ Respaldo técnico y actualizaciones.</Text>
            </View>

            {/* Formulario */}
            <Text style={styles.inputLabel}>Código de Licencia ECP:</Text>
            <TextInput
              style={styles.keyInput}
              placeholder="ECP-XXXXXX-XXXX-ENLACE"
              placeholderTextColor="#94a3b8"
              value={keyInput}
              onChangeText={(t) => setKeyInput(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity 
              style={[styles.activateBtn, loading && { opacity: 0.6 }]} 
              onPress={handleActivate}
              disabled={loading}
            >
              <Text style={styles.activateBtnText}>{loading ? 'Validando...' : '⚡ Activar Mi Licencia'}</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>¿Aún no tienes licencia?</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Botones de Compra */}
            <TouchableOpacity style={styles.buyBtn} onPress={handleOpenWeb}>
              <Text style={styles.buyBtnText}>🌐 Ver Planes en redenlace.cl</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Continuar en Modo Gratis</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: {
    fontSize: 40,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  reasonText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '600',
  },
  benefitsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 5,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  keyInput: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    marginBottom: 14,
  },
  activateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  activateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  separatorText: {
    fontSize: 12,
    color: '#94a3b8',
    marginHorizontal: 8,
  },
  buyBtn: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buyBtnText: {
    color: '#c2410c',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});
