import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { getProjects, addMeasureToChapter, saveProject } from '../store/storage';
import { Project, Chapter, MeasureItem } from '../store/models';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  exportData: {
    descripcion: string;
    cantidad: number;
    unidad: string;
    tipo_medida?: 'area' | 'volumen' | 'lineal' | 'unidad';
  } | null;
}

export default function ExportToProjectModal({ visible, onClose, exportData }: ExportModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (visible) {
      loadProjects();
      setSelectedProject(null);
      setSelectedChapter(null);
      setIsCreatingProject(false);
      setNewProjectName('');
    }
  }, [visible]);

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
  };

  const handleQuickCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Debes ingresar un nombre para el proyecto.');
      return;
    }
    const newProj: Project = {
      id: Date.now().toString(),
      datosGenerales: {
        cliente: 'Sin cliente',
        telefono: '', correo: '', fecha: new Date().toLocaleDateString('es-CL'),
        modo: 'Rápido', plazoEjecucionDias: 0, descripcionObra: newProjectName, notasInternas: '', notasCliente: ''
      },
      capitulos: [
        { id: 'cap_' + Date.now().toString(), nombre: 'General', partidas: [] }
      ]
    };
    await saveProject(newProj);
    await loadProjects();
    setIsCreatingProject(false);
    setNewProjectName('');
    
    // Auto-select the newly created project
    setSelectedProject(newProj);
  };

  const handleExport = async () => {
    if (!selectedProject || !selectedChapter || !exportData) return;

    const newItem: MeasureItem = {
      id: Date.now().toString(),
      descripcion: exportData.descripcion,
      cantidad: exportData.cantidad,
      unidad: exportData.unidad,
      tipo_medida: exportData.tipo_medida || 'unidad',
    };

    const error = await addMeasureToChapter(selectedProject.id, selectedChapter.id, newItem);
    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('¡Éxito!', 'Partida agregada correctamente al proyecto.');
      onClose();
    }
  };

  if (!exportData) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Exportar a Proyecto</Text>
          <Text style={styles.exportDesc}>
            Se agregará: <Text style={{fontWeight:'bold'}}>{exportData.descripcion}</Text> ({exportData.cantidad.toFixed(2)} {exportData.unidad})
          </Text>

          {isCreatingProject ? (
            <View style={styles.quickCreateBox}>
              <Text style={styles.stepTitle}>Crear Proyecto Rápido</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nombre del proyecto o cliente..." 
                value={newProjectName} 
                onChangeText={setNewProjectName} 
              />
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={[styles.cancelBtn, {flex: 1, marginRight: 5}]} onPress={() => setIsCreatingProject(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportBtn, {flex: 1, marginLeft: 5, marginTop: 0}]} onPress={handleQuickCreateProject}>
                  <Text style={styles.exportBtnText}>Crear y Seleccionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !selectedProject ? (
            <>
              <Text style={styles.stepTitle}>1. Selecciona el Proyecto:</Text>
              <TouchableOpacity 
                style={{backgroundColor: '#e0e7ff', padding: 10, borderRadius: 6, alignItems: 'center', marginBottom: 15}} 
                onPress={() => setIsCreatingProject(true)}
              >
                <Text style={{color: '#4f46e5', fontWeight: 'bold'}}>➕ Crear Proyecto Rápido</Text>
              </TouchableOpacity>

              {projects.length === 0 ? (
                <Text style={styles.noDataText}>No tienes proyectos creados aún.</Text>
              ) : (
                <ScrollView style={styles.list}>
                  {projects.map(p => (
                    <TouchableOpacity key={p.id} style={styles.listItem} onPress={() => setSelectedProject(p)}>
                      <Text style={styles.listItemText}>🏗️ {p.datosGenerales.descripcionObra || 'Sin nombre'}</Text>
                      <Text style={styles.listItemSubText}>{p.datosGenerales.cliente}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : !selectedChapter ? (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.stepTitle}>2. Selecciona el Capítulo:</Text>
                <TouchableOpacity onPress={() => setSelectedProject(null)}>
                  <Text style={styles.backBtn}>Volver</Text>
                </TouchableOpacity>
              </View>
              
              {!selectedProject.capitulos || selectedProject.capitulos.length === 0 ? (
                <Text style={styles.noDataText}>Este proyecto no tiene capítulos.</Text>
              ) : (
                <ScrollView style={styles.list}>
                  {selectedProject.capitulos.map(c => (
                    <TouchableOpacity key={c.id} style={styles.listItem} onPress={() => setSelectedChapter(c)}>
                      <Text style={styles.listItemText}>📂 {c.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>Proyecto: {selectedProject.datosGenerales.descripcionObra}</Text>
              <Text style={styles.confirmText}>Capítulo: {selectedChapter.nombre}</Text>
              
              <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                <Text style={styles.exportBtnText}>Confirmar y Enviar ✔️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedChapter(null)}>
                <Text style={styles.cancelBtnText}>Cambiar capítulo</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtnModal} onPress={onClose}>
            <Text style={styles.closeBtnTextModal}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.card, borderRadius: 12, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  exportDesc: { fontSize: 14, color: colors.secondary, marginBottom: 20, backgroundColor: '#f1f5f9', padding: 10, borderRadius: 6 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { color: colors.primary, fontWeight: 'bold' },
  list: { maxHeight: 300 },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  listItemText: { fontSize: 16, color: colors.text, fontWeight: '500' },
  listItemSubText: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  noDataText: { color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  confirmBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  confirmText: { fontSize: 15, color: colors.text, marginBottom: 8, fontWeight: '500' },
  exportBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  exportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center', marginTop: 5 },
  cancelBtnText: { color: colors.textLight },
  closeBtnModal: { marginTop: 20, padding: 12, alignItems: 'center' },
  closeBtnTextModal: { color: colors.danger, fontWeight: 'bold', fontSize: 16 },
  quickCreateBox: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 6, marginBottom: 15 },
});
