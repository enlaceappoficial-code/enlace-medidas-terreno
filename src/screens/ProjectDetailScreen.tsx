import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { getProjects, saveProject } from '../store/storage';
import { Project, Chapter, MeasureItem } from '../store/models';
import { exportProjectJSON, exportProjectCSV, exportProjectPDF, exportProjectText } from '../utils/exporter';

export default function ProjectDetailScreen({ route, navigation }: any) {
  const passedProject = route.params?.project;
  const projectId = passedProject?.id || route.params?.projectId;

  const [project, setProject] = useState<Project | null>(passedProject || null);
  const [activeTab, setActiveTab] = useState<'capitulos' | 'notas' | 'fotos'>('capitulos');
  const [isExportModal, setExportModal] = useState(false);

  // Modal Capítulo
  const [isCapituloModal, setCapituloModal] = useState(false);
  const [newCapituloName, setNewCapituloName] = useState('');

  // Modal Partida
  const [isPartidaModal, setPartidaModal] = useState(false);
  const [activeCapituloId, setActiveCapituloId] = useState<string | null>(null);
  const [editingPartidaId, setEditingPartidaId] = useState<string | null>(null);
  
  // Modal Ver Partida
  const [isViewModal, setViewModal] = useState(false);
  const [viewingPartida, setViewingPartida] = useState<MeasureItem | null>(null);
  
  // Estados de Partida
  const [partidaDesc, setPartidaDesc] = useState('');
  const [partidaTipo, setPartidaTipo] = useState<'lineal' | 'area' | 'volume' | 'unidad'>('area');
  const [partidaLargo, setPartidaLargo] = useState('');
  const [partidaAncho, setPartidaAncho] = useState('');
  const [partidaAlto, setPartidaAlto] = useState('');
  const [partidaCantManual, setPartidaCantManual] = useState('');
  const [partidaUnidad, setPartidaUnidad] = useState('m2');
  const [partidaNota, setPartidaNota] = useState('');
  const [partidaFotos, setPartidaFotos] = useState<string[]>([]);

  // Modal Nota
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteType, setNoteType] = useState<'libre' | 'interna' | 'cliente'>('libre');

  useEffect(() => {
    const load = async () => {
      if (projectId) {
        const all = await getProjects();
        const found = all.find(p => p.id === projectId);
        if (found) setProject(found);
      }
    };
    load();
  }, [projectId]);

  const saveState = async (updated: Project) => {
    setProject(updated);
    try {
      await saveProject(updated);
    } catch (e) {
      console.log('Error saving', e);
    }
  };

  const handleAddCapitulo = async () => {
    if (!newCapituloName.trim() || !project) return;
    const newCap: Chapter = { id: Date.now().toString(), nombre: newCapituloName, partidas: [] };
    const updated = { ...project, capitulos: [...(project.capitulos || []), newCap] };
    await saveState(updated);
    setNewCapituloName('');
    setCapituloModal(false);
  };

  const handleDeleteCapitulo = (capId: string) => {
    if (!project) return;
    Alert.alert('Eliminar Capítulo', '¿Eliminar este capítulo y todas sus mediciones?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          const updated = { ...project, capitulos: (project.capitulos || []).filter(c => c.id !== capId) };
          await saveState(updated);
        }
      }
    ]);
  };

  const openPartidaModal = (capId: string, p?: MeasureItem) => {
    setActiveCapituloId(capId);
    if (p) {
      setEditingPartidaId(p.id);
      setPartidaDesc(p.descripcion);
      setPartidaTipo(p.tipo_medida);
      setPartidaUnidad(p.unidad);
      setPartidaNota(p.nota || '');
      setPartidaFotos(p.fotos || []);
      setPartidaLargo(p.detalles?.largo ? String(p.detalles.largo) : '');
      setPartidaAncho(p.detalles?.ancho ? String(p.detalles.ancho) : '');
      setPartidaAlto(p.detalles?.alto ? String(p.detalles.alto) : '');
      setPartidaCantManual(p.tipo_medida === 'unidad' ? String(p.cantidad) : (p.detalles ? '' : String(p.cantidad)));
    } else {
      setEditingPartidaId(null);
      setPartidaDesc('');
      setPartidaTipo('area');
      setPartidaLargo('');
      setPartidaAncho('');
      setPartidaAlto('');
      setPartidaCantManual('');
      setPartidaUnidad('m2');
      setPartidaNota('');
      setPartidaFotos([]);
    }
    setPartidaModal(true);
  };

  const changePartidaTipo = (tipo: 'lineal' | 'area' | 'volume' | 'unidad') => {
    setPartidaTipo(tipo);
    if (tipo === 'lineal') setPartidaUnidad('ml');
    if (tipo === 'area') setPartidaUnidad('m2');
    if (tipo === 'volume') setPartidaUnidad('m3');
    if (tipo === 'unidad') setPartidaUnidad('un');
  };

  const pickImage = async (onSuccess: (uri: string) => void) => {
    Alert.alert('Añadir Foto', '¿De dónde quieres obtener la foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cámara', onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
          if (!result.canceled && result.assets) onSuccess(result.assets[0].uri);
        }
      },
      { text: 'Galería', onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
          if (!result.canceled && result.assets) onSuccess(result.assets[0].uri);
        }
      }
    ]);
  };

  const handleAddPartidaPhoto = () => {
    pickImage((uri) => {
      setPartidaFotos([...partidaFotos, uri]);
    });
  };

  const handleAddPartida = async () => {
    if (!partidaDesc.trim() || !project || !activeCapituloId) return;

    let cantFinal = 0;
    const pL = parseFloat(partidaLargo.replace(',', '.')) || 0;
    const pA = parseFloat(partidaAncho.replace(',', '.')) || 0;
    const pH = parseFloat(partidaAlto.replace(',', '.')) || 0;
    const pCantManual = parseFloat(partidaCantManual.replace(',', '.')) || 0;
    
    if (partidaTipo === 'area') cantFinal = (pL && pA) ? (pL * pA) : pCantManual;
    else if (partidaTipo === 'volume') cantFinal = (pL && pA && pH) ? (pL * pA * pH) : pCantManual;
    else if (partidaTipo === 'lineal') cantFinal = pL ? pL : pCantManual;
    else cantFinal = pCantManual;

    if (cantFinal === 0) {
      Alert.alert('Error', 'La cantidad calculada es 0.');
      return;
    }

    const newItem: MeasureItem = {
      id: editingPartidaId || Date.now().toString(),
      descripcion: partidaDesc,
      tipo_medida: partidaTipo,
      cantidad: parseFloat(cantFinal.toFixed(2)),
      unidad: partidaUnidad || 'un',
      nota: partidaNota.trim() || undefined,
      fotos: partidaFotos.length > 0 ? partidaFotos : undefined,
      detalles: { largo: pL, ancho: pA, alto: pH }
    };
    
    const updatedCaps = (project.capitulos || []).map(c => {
      if (c.id === activeCapituloId) {
        if (editingPartidaId) {
          return { ...c, partidas: (c.partidas || []).map(p => p.id === editingPartidaId ? newItem : p) };
        } else {
          return { ...c, partidas: [...(c.partidas || []), newItem] };
        }
      }
      return c;
    });
    
    await saveState({ ...project, capitulos: updatedCaps });
    setPartidaModal(false);
  };

  const handleDeletePartida = (capId: string, partId: string) => {
    if (!project) return;
    const updatedCaps = (project.capitulos || []).map(c => 
      c.id === capId ? { ...c, partidas: (c.partidas || []).filter(p => p.id !== partId) } : c
    );
    saveState({ ...project, capitulos: updatedCaps });
  };

  // --- NOTAS ---
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !project) return;
    let updated = { ...project };
    
    if (noteType === 'interna') {
      updated.datosGenerales = { 
        ...updated.datosGenerales, 
        notasInternas: updated.datosGenerales.notasInternas ? updated.datosGenerales.notasInternas + '\n' + newNoteText : newNoteText 
      };
    } else if (noteType === 'cliente') {
      updated.datosGenerales = { 
        ...updated.datosGenerales, 
        notasCliente: updated.datosGenerales.notasCliente ? updated.datosGenerales.notasCliente + '\n' + newNoteText : newNoteText 
      };
    } else {
      const newNote = { id: Date.now().toString(), contenido: newNoteText, fechaCreacion: new Date().toISOString() };
      updated.notas = [...(updated.notas || []), newNote];
    }
    
    await saveState(updated);
    setNewNoteText('');
    setNoteModalVisible(false);
  };

  // --- FOTOS GENERALES ---
  const handleAddProjectPhoto = () => {
    pickImage(async (uri) => {
      if (!project) return;
      const newPhoto = { id: Date.now().toString(), uri, fechaCaptura: new Date().toISOString() };
      const updated = { ...project, fotos: [...(project.fotos || []), newPhoto] };
      await saveState(updated);
    });
  };

  if (!project) return <View style={styles.container}><Text style={{padding: 20}}>Cargando proyecto...</Text></View>;
  const { datosGenerales } = project;

  // Extraer notas de partidas
  const notasDePartidas: { capNombre: string, partidaDesc: string, nota: string }[] = [];
  // Extraer fotos de partidas
  const fotosDePartidas: { capNombre: string, partidaDesc: string, uri: string }[] = [];
  
  (project.capitulos || []).forEach(cap => {
    (cap.partidas || []).forEach(p => {
      if (p.nota) notasDePartidas.push({ capNombre: cap.nombre, partidaDesc: p.descripcion, nota: p.nota });
      if (p.fotos && p.fotos.length > 0) {
        p.fotos.forEach(uri => {
          fotosDePartidas.push({ capNombre: cap.nombre, partidaDesc: p.descripcion, uri });
        });
      }
    });
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.headerTitle, {flexShrink: 1}]} numberOfLines={1}>{datosGenerales.descripcionObra || 'Proyecto sin título'}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateProject', { project })} style={{marginLeft: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4}}>
                <Text style={{color: '#fff', fontSize: 12}}>✏️ Editar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSub}>👤 Cliente: {datosGenerales.cliente}</Text>
          </View>
          <TouchableOpacity onPress={() => setExportModal(true)} style={{backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 10}}>
            <Text style={{color: colors.primary, fontWeight: 'bold', fontSize: 13}}>📤 Exportar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'capitulos' && styles.tabActive]} onPress={() => setActiveTab('capitulos')}>
          <Text style={[styles.tabText, activeTab === 'capitulos' && styles.tabTextActive]}>🏗️ Capítulos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'notas' && styles.tabActive]} onPress={() => setActiveTab('notas')}>
          <Text style={[styles.tabText, activeTab === 'notas' && styles.tabTextActive]}>📝 Notas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'fotos' && styles.tabActive]} onPress={() => setActiveTab('fotos')}>
          <Text style={[styles.tabText, activeTab === 'fotos' && styles.tabTextActive]}>📷 Fotos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* TAB CAPÍTULOS */}
        {activeTab === 'capitulos' && (
          <View>
            {(project.capitulos || []).map(cap => (
              <View key={cap.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{cap.nombre}</Text>
                  <TouchableOpacity onPress={() => handleDeleteCapitulo(cap.id)}><Text style={styles.deleteIcon}>🗑️</Text></TouchableOpacity>
                </View>

                {(!cap.partidas || cap.partidas.length === 0) ? (
                  <Text style={styles.emptyText}>No hay mediciones en este capítulo.</Text>
                ) : (
                  cap.partidas.map(p => (
                    <TouchableOpacity key={p.id} style={styles.itemRow} onPress={() => { setViewingPartida(p); setViewModal(true); }} activeOpacity={0.7}>
                      <View style={{flex: 1}}>
                        <Text style={styles.itemDesc}>• {p.descripcion}</Text>
                        <Text style={styles.itemTypeInfo}>
                          {p.tipo_medida.toUpperCase()} | {p.nota ? '📝 Nota' : ''} {p.fotos ? '📷 '+p.fotos.length : ''}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.itemCant} numberOfLines={1}>{parseFloat(Number(p.cantidad).toFixed(2))} {p.unidad}</Text>
                        
                        <TouchableOpacity onPress={() => openPartidaModal(cap.id, p)} style={{marginLeft: 10, padding: 8}}>
                          <Text style={{fontSize: 16}}>✏️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDeletePartida(cap.id, p.id)} style={{marginLeft: 2, padding: 8}}>
                          <Text style={{color: '#ef4444', fontWeight: 'bold', fontSize: 16}}>X</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => openPartidaModal(cap.id)}>
                  <Text style={styles.addBtnSmallText}>+ Añadir Partida (Medición)</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.mainActionBtn} onPress={() => setCapituloModal(true)}>
              <Text style={styles.mainActionBtnText}>+ Crear Nuevo Capítulo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB NOTAS */}
        {activeTab === 'notas' && (
          <View>
            {/* Notas del Proyecto (Internas/Cliente) */}
            {(datosGenerales.notasInternas || datosGenerales.notasCliente) && (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Notas Oficiales del Proyecto</Text>
                {!!datosGenerales.notasInternas && (
                  <View style={{marginBottom: 12}}>
                    <Text style={styles.tagInterna}>Interna (Solo Presupuesto)</Text>
                    <Text style={styles.noteText}>{datosGenerales.notasInternas}</Text>
                  </View>
                )}
                {!!datosGenerales.notasCliente && (
                  <View>
                    <Text style={styles.tagCliente}>Cliente (Visible en PDF)</Text>
                    <Text style={styles.noteText}>{datosGenerales.notasCliente}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Notas Libres */}
            {(project.notas && project.notas.length > 0) && (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Notas Libres / Apuntes</Text>
                {project.notas.map((nota) => (
                  <View key={nota.id} style={{marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={styles.noteDate}>{new Date(nota.fechaCreacion).toLocaleDateString()}</Text>
                      <TouchableOpacity onPress={() => handleDeleteNote(nota.id)}><Text style={{color: 'red', fontSize: 12}}>Eliminar</Text></TouchableOpacity>
                    </View>
                    <Text style={styles.noteText}>{nota.contenido}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Notas de Partidas */}
            {notasDePartidas.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Notas de Partidas</Text>
                {notasDePartidas.map((np, idx) => (
                  <View key={idx} style={styles.partidaNoteBox}>
                    <Text style={styles.partidaTag}>🔹 {np.capNombre} {'>'} {np.partidaDesc}</Text>
                    <Text style={styles.noteText}>{np.nota}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.mainActionBtn} onPress={() => setNoteModalVisible(true)}>
              <Text style={styles.mainActionBtnText}>+ Nueva Nota</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB FOTOS */}
        {activeTab === 'fotos' && (
          <View>
            {/* Fotos Generales */}
            {(project.fotos && project.fotos.length > 0) && (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Fotos Generales del Proyecto</Text>
                <View style={styles.photoGrid}>
                  {project.fotos.map((foto) => (
                    <View key={foto.id} style={styles.photoContainer}>
                      <Image source={{ uri: foto.uri }} style={styles.photo} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Fotos de Partidas */}
            {fotosDePartidas.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Fotos por Partida</Text>
                <View style={styles.photoGrid}>
                  {fotosDePartidas.map((fp, idx) => (
                    <View key={idx} style={styles.photoContainer}>
                      <Text style={styles.partidaPhotoTag} numberOfLines={1}>{fp.partidaDesc}</Text>
                      <Image source={{ uri: fp.uri }} style={styles.photo} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(!project.fotos?.length && fotosDePartidas.length === 0) && (
               <Text style={styles.emptyText}>No hay fotos en este proyecto.</Text>
            )}

            <TouchableOpacity style={styles.mainActionBtn} onPress={handleAddProjectPhoto}>
              <Text style={styles.mainActionBtnText}>+ Tomar Foto General</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL CREAR CAPÍTULO */}
      <Modal visible={isCapituloModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Capítulo</Text>
            <Text style={styles.label}>Ej: Gasfitería, Cerámicas Piso</Text>
            <TextInput style={styles.input} placeholder="Nombre del capítulo" value={newCapituloName} onChangeText={setNewCapituloName} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setCapituloModal(false)}><Text style={styles.modalBtnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleAddCapitulo}><Text style={styles.modalBtnSaveText}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CREAR PARTIDA (CALCULADORA + NOTAS/FOTOS) */}
      <Modal visible={isPartidaModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Calculadora de Partida</Text>
              
              <TouchableOpacity 
                style={{backgroundColor: '#e0e7ff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'center', borderWidth: 1, borderColor: '#c7d2fe'}}
                onPress={() => {
                  setPartidaModal(false);
                  navigation.navigate('MainTabs', { screen: 'Herramientas' });
                }}
              >
                <Text style={{color: '#4f46e5', fontWeight: 'bold'}}>🪄 Ir a Herramientas Avanzadas</Text>
              </TouchableOpacity>
              
              <Text style={styles.label}>Descripción</Text>
              <TextInput style={styles.input} placeholder="Ej: Porcelanato Piso" value={partidaDesc} onChangeText={setPartidaDesc} />
              
              <Text style={styles.label}>Tipo de Medición</Text>
              <View style={styles.tipoRow}>
                <TouchableOpacity style={[styles.tipoBtn, partidaTipo === 'area' && styles.tipoBtnActive]} onPress={() => changePartidaTipo('area')}><Text style={[styles.tipoBtnText, partidaTipo === 'area' && styles.tipoBtnTextActive]}>Área</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipoBtn, partidaTipo === 'lineal' && styles.tipoBtnActive]} onPress={() => changePartidaTipo('lineal')}><Text style={[styles.tipoBtnText, partidaTipo === 'lineal' && styles.tipoBtnTextActive]}>Lineal</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipoBtn, partidaTipo === 'volume' && styles.tipoBtnActive]} onPress={() => changePartidaTipo('volume')}><Text style={[styles.tipoBtnText, partidaTipo === 'volume' && styles.tipoBtnTextActive]}>Volumen</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipoBtn, partidaTipo === 'unidad' && styles.tipoBtnActive]} onPress={() => changePartidaTipo('unidad')}><Text style={[styles.tipoBtnText, partidaTipo === 'unidad' && styles.tipoBtnTextActive]}>Unidad</Text></TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                {(partidaTipo === 'area' || partidaTipo === 'volume' || partidaTipo === 'lineal') && (
                  <View style={{flex: 1, marginRight: 8}}><Text style={styles.label}>Largo (m)</Text><TextInput style={styles.input} keyboardType="numeric" value={partidaLargo} onChangeText={setPartidaLargo} /></View>
                )}
                {(partidaTipo === 'area' || partidaTipo === 'volume') && (
                  <View style={{flex: 1, marginRight: 8}}><Text style={styles.label}>Ancho (m)</Text><TextInput style={styles.input} keyboardType="numeric" value={partidaAncho} onChangeText={setPartidaAncho} /></View>
                )}
                {partidaTipo === 'volume' && (
                  <View style={{flex: 1, marginRight: 8}}><Text style={styles.label}>Alto (m)</Text><TextInput style={styles.input} keyboardType="numeric" value={partidaAlto} onChangeText={setPartidaAlto} /></View>
                )}
                {partidaTipo === 'unidad' && (
                  <View style={{flex: 1, marginRight: 8}}><Text style={styles.label}>Cantidad</Text><TextInput style={styles.input} keyboardType="numeric" value={partidaCantManual} onChangeText={setPartidaCantManual} /></View>
                )}
                <View style={{flex: 0.6}}><Text style={styles.label}>Unidad</Text><TextInput style={styles.input} value={partidaUnidad} onChangeText={setPartidaUnidad} /></View>
              </View>

              {/* PREVISUALIZAR RESULTADO EN TIEMPO REAL */}
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Total Calculado:</Text>
                <Text style={styles.resultValue}>
                  {partidaTipo === 'area' ? ((parseFloat(partidaLargo.replace(',', '.'))||0) * (parseFloat(partidaAncho.replace(',', '.'))||0)).toFixed(2) :
                   partidaTipo === 'volume' ? ((parseFloat(partidaLargo.replace(',', '.'))||0) * (parseFloat(partidaAncho.replace(',', '.'))||0) * (parseFloat(partidaAlto.replace(',', '.'))||0)).toFixed(2) :
                   partidaTipo === 'lineal' ? (parseFloat(partidaLargo.replace(',', '.'))||0).toFixed(2) :
                   (parseFloat(partidaCantManual.replace(',', '.'))||0)} {partidaUnidad}
                </Text>
              </View>

              {/* ANOTACIONES Y FOTOS DE PARTIDA */}
              <View style={{height: 1, backgroundColor: colors.border, marginVertical: 12}} />
              <Text style={styles.label}>Nota específica de esta partida (Opcional)</Text>
              <TextInput style={[styles.input, {height: 60, textAlignVertical: 'top'}]} placeholder="Observaciones de esta medida..." multiline value={partidaNota} onChangeText={setPartidaNota} />
              
              <TouchableOpacity style={styles.addBtnSmall} onPress={handleAddPartidaPhoto}>
                <Text style={styles.addBtnSmallText}>📷 Añadir Foto a Partida</Text>
              </TouchableOpacity>
              {partidaFotos.length > 0 && (
                <View style={{flexDirection: 'row', marginTop: 8}}>
                  {partidaFotos.map((uri, idx) => (
                    <Image key={idx} source={{uri}} style={{width: 40, height: 40, borderRadius: 4, marginRight: 8}} />
                  ))}
                </View>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setPartidaModal(false)}><Text style={styles.modalBtnCancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={handleAddPartida}><Text style={styles.modalBtnSaveText}>Guardar Partida</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      
      {/* MODAL VER PARTIDA (SOLO LECTURA) */}
      <Modal visible={isViewModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {viewingPartida && (
              <>
                <Text style={styles.modalTitle}>Resumen de Medición</Text>
                
                <View style={{marginBottom: 16}}>
                  <Text style={{fontSize: 16, fontWeight: 'bold', color: colors.primary}}>{viewingPartida.descripcion}</Text>
                  <Text style={{fontSize: 13, color: colors.textLight, marginTop: 4}}>Tipo de cálculo: {viewingPartida.tipo_medida.toUpperCase()}</Text>
                </View>

                <View style={{backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16}}>
                  {viewingPartida.detalles?.largo !== undefined && viewingPartida.detalles.largo !== '' && <Text style={{fontSize: 14, marginBottom: 4}}>Largo: {viewingPartida.detalles.largo} m</Text>}
                  {viewingPartida.detalles?.ancho !== undefined && viewingPartida.detalles.ancho !== '' && <Text style={{fontSize: 14, marginBottom: 4}}>Ancho: {viewingPartida.detalles.ancho} m</Text>}
                  {viewingPartida.detalles?.alto !== undefined && viewingPartida.detalles.alto !== '' && <Text style={{fontSize: 14, marginBottom: 4}}>Alto: {viewingPartida.detalles.alto} m</Text>}
                  
                  <View style={{height: 1, backgroundColor: '#e2e8f0', marginVertical: 8}} />
                  <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.secondary}}>Total: {viewingPartida.cantidad} {viewingPartida.unidad}</Text>
                </View>

                {viewingPartida.nota && (
                  <View style={{marginBottom: 16}}>
                    <Text style={{fontSize: 14, fontWeight: 'bold', color: colors.text}}>Anotación:</Text>
                    <Text style={{fontSize: 14, color: '#475569', marginTop: 4}}>{viewingPartida.nota}</Text>
                  </View>
                )}

                {viewingPartida.fotos && viewingPartida.fotos.length > 0 && (
                  <View style={{marginBottom: 16}}>
                    <Text style={{fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 8}}>Fotos adjuntas:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {viewingPartida.fotos.map((uri, idx) => (
                        <Image key={idx} source={{uri}} style={{width: 80, height: 80, borderRadius: 8, marginRight: 8, backgroundColor: '#eee'}} />
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity style={{backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center'}} onPress={() => setViewModal(false)}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      
      {/* MODAL EXPORTAR */}
      <Modal visible={isExportModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones de Exportación</Text>
            <Text style={{fontSize: 14, color: '#475569', marginBottom: 16}}>Selecciona en qué formato deseas compartir este proyecto.</Text>
            
            
            <TouchableOpacity 
              style={{backgroundColor: '#eab308', padding: 14, borderRadius: 8, marginBottom: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => { exportProjectText(project); setExportModal(false); }}
            >
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>📝 Enviar Texto (WhatsApp)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{backgroundColor: '#ef4444', padding: 14, borderRadius: 8, marginBottom: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => { exportProjectPDF(project); setExportModal(false); }}
            >
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>📄 Exportar como PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{backgroundColor: '#10b981', padding: 14, borderRadius: 8, marginBottom: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => { exportProjectCSV(project); setExportModal(false); }}
            >
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>📊 Exportar a Excel (CSV)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, marginBottom: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => { exportProjectJSON(project); setExportModal(false); }}
            >
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>💻 Exportar JSON (Para PC)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{padding: 12, alignItems: 'center'}} onPress={() => setExportModal(false)}>
              <Text style={{color: '#64748b', fontWeight: 'bold'}}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CREAR NOTA GENERAL */}
      <Modal visible={isNoteModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir Nota</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity style={[styles.tipoBtn, noteType === 'libre' && styles.tipoBtnActive]} onPress={() => setNoteType('libre')}><Text style={[styles.tipoBtnText, noteType === 'libre' && styles.tipoBtnTextActive]}>Libre</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tipoBtn, noteType === 'interna' && styles.tipoBtnActive]} onPress={() => setNoteType('interna')}><Text style={[styles.tipoBtnText, noteType === 'interna' && styles.tipoBtnTextActive]}>Interna</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tipoBtn, noteType === 'cliente' && styles.tipoBtnActive]} onPress={() => setNoteType('cliente')}><Text style={[styles.tipoBtnText, noteType === 'cliente' && styles.tipoBtnTextActive]}>Cliente</Text></TouchableOpacity>
            </View>

            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Escribe tu nota aquí..." multiline value={newNoteText} onChangeText={setNewNoteText} />
            
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setNoteModalVisible(false)}><Text style={styles.modalBtnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleAddNote}><Text style={styles.modalBtnSaveText}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBox: { backgroundColor: colors.primary, padding: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  headerSub: { color: '#cbd5e1', fontSize: 13, marginBottom: 2 },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 4 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.secondary },
  tabText: { color: colors.textLight, fontWeight: 'bold' },
  tabTextActive: { color: colors.primary },
  
  contentScroll: { flex: 1, padding: 16 },
  
  card: { backgroundColor: colors.card, borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6 },
  
  deleteIcon: { fontSize: 20 },
  emptyText: { color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 10, borderRadius: 6, marginBottom: 8, alignItems: 'center' },
  itemDesc: { fontSize: 15, color: colors.text, fontWeight: '500' },
  itemTypeInfo: { fontSize: 11, color: colors.textLight, marginTop: 2, marginLeft: 8 },
  itemCant: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
  
  addBtnSmall: { marginTop: 8, padding: 12, backgroundColor: '#e2e8f0', borderRadius: 6, alignItems: 'center' },
  addBtnSmallText: { color: colors.primary, fontWeight: 'bold' },
  
  mainActionBtn: { backgroundColor: colors.secondary, padding: 16, borderRadius: 8, alignItems: 'center', marginVertical: 8, elevation: 2 },
  mainActionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  noteText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  tagInterna: { fontSize: 11, fontWeight: 'bold', color: '#ea580c', marginBottom: 2 },
  tagCliente: { fontSize: 11, fontWeight: 'bold', color: '#16a34a', marginBottom: 2 },
  partidaTag: { fontSize: 12, fontWeight: 'bold', color: colors.secondary, marginBottom: 4 },
  partidaNoteBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 12 },
  modalScroll: { flexGrow: 1, justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15, backgroundColor: '#f8fafc' },
  
  tipoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tipoBtn: { flex: 1, padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 6, alignItems: 'center', marginHorizontal: 2 },
  tipoBtnActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  tipoBtnText: { fontSize: 12, fontWeight: '600', color: colors.textLight },
  tipoBtnTextActive: { color: '#fff' },

  resultBox: { backgroundColor: '#eef2ff', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  resultLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  resultValue: { fontSize: 22, fontWeight: 'bold', color: colors.primary },

  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  modalBtnCancel: { padding: 12, marginRight: 8 },
  modalBtnCancelText: { color: colors.textLight, fontWeight: 'bold' },
  modalBtnSave: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  modalBtnSaveText: { color: '#fff', fontWeight: 'bold' },

  noteDate: { fontSize: 11, color: colors.textLight, fontWeight: 'bold', marginBottom: 4 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photoContainer: { width: '48%', aspectRatio: 1, marginBottom: 16, position: 'relative', backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', borderRadius: 8 },
  partidaPhotoTag: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: 4, zIndex: 5, textAlign: 'center' }
});
