import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { getProjects } from '../store/storage';
import { Project } from '../store/models';

export default function ClientsScreen({ navigation }: any) {
  const [clients, setClients] = useState<{ nombre: string, telefono: string, correo: string, proyectos: number }[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClients();
    });
    loadClients();
    return unsubscribe;
  }, [navigation]);

  const loadClients = async () => {
    const projects = await getProjects();
    const clientMap: { [key: string]: { telefono: string, correo: string, count: number } } = {};

    projects.forEach(p => {
      const { cliente, telefono, correo } = p.datosGenerales;
      if (cliente) {
        if (!clientMap[cliente]) {
          clientMap[cliente] = { 
            telefono: telefono || 'Sin teléfono', 
            correo: correo || 'Sin correo', 
            count: 1 
          };
        } else {
          clientMap[cliente].count++;
        }
      }
    });

    const clientList = Object.keys(clientMap).map(key => ({
      nombre: key,
      telefono: clientMap[key].telefono,
      correo: clientMap[key].correo,
      proyectos: clientMap[key].count
    }));

    // Ordenar alfabéticamente
    clientList.sort((a, b) => a.nombre.localeCompare(b.nombre));

    setClients(clientList);
  };

  const handleCall = (phone: string) => {
    if (phone && phone !== 'Sin teléfono') {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
    }
  };

  const handleWhatsApp = (phone: string) => {
    if (phone && phone !== 'Sin teléfono') {
      // Remover espacios y + para formar el formato de wa.me
      const cleanPhone = phone.replace(/[\s+]/g, '');
      Linking.openURL(`https://wa.me/${cleanPhone}`);
    }
  };

  const handleEmail = (email: string) => {
    if (email && email !== 'Sin correo') {
      Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Directorio de Clientes ({clients.length})</Text>
      
      {clients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aún no tienes clientes.</Text>
          <Text style={styles.emptyStateSub}>Se agregarán automáticamente cuando crees tus primeras Visitas a Terreno.</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.clientCard}>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{item.nombre}</Text>
                <Text style={styles.clientProjects}>{item.proyectos} Visita{item.proyectos > 1 ? 's' : ''} registrada{item.proyectos > 1 ? 's' : ''}</Text>
                {item.telefono !== 'Sin teléfono' && <Text style={styles.clientSubtext}>📱 {item.telefono}</Text>}
                {item.correo !== 'Sin correo' && <Text style={styles.clientSubtext}>✉️ {item.correo}</Text>}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.callBtn, item.telefono === 'Sin teléfono' && styles.disabledBtn]} 
                  onPress={() => handleCall(item.telefono)}
                  disabled={item.telefono === 'Sin teléfono'}
                >
                  <Text style={styles.actionIcon}>📞</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.waBtn, item.telefono === 'Sin teléfono' && styles.disabledBtn]} 
                  onPress={() => handleWhatsApp(item.telefono)}
                  disabled={item.telefono === 'Sin teléfono'}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.mailBtn, item.correo === 'Sin correo' && styles.disabledBtn]} 
                  onPress={() => handleEmail(item.correo)}
                  disabled={item.correo === 'Sin correo'}
                >
                  <Text style={styles.actionIcon}>📧</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  emptyStateText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateSub: {
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  clientCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'column',
    elevation: 1,
  },
  clientInfo: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  clientProjects: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  clientSubtext: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  callBtn: { backgroundColor: '#3b82f6' }, // Blue
  waBtn: { backgroundColor: '#22c55e' }, // Green
  mailBtn: { backgroundColor: '#f59e0b' }, // Orange/Yellow
  disabledBtn: {
    backgroundColor: colors.border,
    elevation: 0,
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 20,
    color: '#fff',
  }
});
