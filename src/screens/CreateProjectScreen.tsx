import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { saveProject, canCreateProject } from '../store/storage';
import { Project } from '../store/models';

export default function CreateProjectScreen({ route, navigation }: any) {
  const existingProject = route.params?.project;

  const [cliente, setCliente] = useState(existingProject ? (existingProject.datosGenerales.cliente === 'Sin cliente' ? '' : existingProject.datosGenerales.cliente) : '');
  const [telefono, setTelefono] = useState(existingProject?.datosGenerales.telefono || '');
  const [correo, setCorreo] = useState(existingProject?.datosGenerales.correo || '');
  const [descripcionObra, setDescripcionObra] = useState(existingProject?.datosGenerales.descripcionObra || '');
  const [plazo, setPlazo] = useState(existingProject?.datosGenerales.plazoEjecucionDias?.toString() || '');
  const [notas, setNotas] = useState(existingProject?.datosGenerales.notasInternas || '');
  const [notasCliente, setNotasCliente] = useState(existingProject?.datosGenerales.notasCliente || '');

  const handleSave = async () => {
    if (!cliente || !descripcionObra) {
      Alert.alert('Faltan Datos', 'Por favor ingresa al menos el cliente y la descripción de la obra.');
      return;
    }

    if (!existingProject) {
      const check = await canCreateProject();
      if (!check.allowed) {
        Alert.alert(
          'Límite de Visitas Alcanzado',
          'Has alcanzado el límite de 2 visitas en el Modo Gratis. Activa tu Plan Pro de Enlace Constructor Pro en Configuración para crear visitas ilimitadas.'
        );
        return;
      }
    }

    const projectToSave: Project = {
      id: existingProject ? existingProject.id : Math.random().toString(36).substr(2, 9),
      datosGenerales: {
        cliente,
        telefono,
        correo,
        fecha: existingProject ? existingProject.datosGenerales.fecha : new Date().toLocaleDateString('es-CL'),
        modo: 'Completo',
        plazoEjecucionDias: parseInt(plazo) || 0,
        descripcionObra,
        notasInternas: notas,
        notasCliente
      },
      capitulos: existingProject ? existingProject.capitulos : []
    };

    await saveProject(projectToSave);
    
    if (existingProject) {
      navigation.goBack();
    } else {
      navigation.replace('ProjectDetail', { project: projectToSave });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 300 }} 
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>{existingProject ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}</Text>
        
        <Text style={styles.label}>Nombre de la Obra / Proyecto *</Text>
        <TextInput 
          style={styles.input} 
          value={descripcionObra} 
          onChangeText={setDescripcionObra} 
          placeholder="Ej: Radier Terraza..." 
        />

        <Text style={styles.label}>Cliente *</Text>
        <TextInput 
          style={styles.input} 
          value={cliente} 
          onChangeText={setCliente} 
          placeholder="Nombre del cliente" 
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput 
          style={styles.input} 
          value={telefono} 
          onChangeText={setTelefono} 
          placeholder="+56 9..." 
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Correo (Opcional)</Text>
        <TextInput 
          style={styles.input} 
          value={correo} 
          onChangeText={setCorreo} 
          placeholder="email@correo.com" 
          keyboardType="email-address"
        />

        <Text style={styles.label}>Plazo Ejecución (Días)</Text>
        <TextInput 
          style={styles.input} 
          value={plazo} 
          onChangeText={setPlazo} 
          placeholder="Ej: 15" 
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notas Internas</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={notas} 
          onChangeText={setNotas} 
          placeholder="Solo para ti..."
          multiline 
        />

        <Text style={styles.label}>Notas para el Cliente</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={notasCliente} 
          onChangeText={setNotasCliente} 
          placeholder="Saldrán en la cotización..."
          multiline 
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{existingProject ? 'Actualizar Proyecto' : 'Guardar y Comenzar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  label: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.secondary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});