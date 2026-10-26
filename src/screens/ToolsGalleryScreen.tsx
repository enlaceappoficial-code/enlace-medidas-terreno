import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';

interface Photo { uri: string; title: string; }
interface Album { id: string; name: string; photos: Photo[]; }

export default function ToolsGalleryScreen() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  
  const [newAlbumName, setNewAlbumName] = useState('');
  const [modalAlbumVisible, setModalAlbumVisible] = useState(false);

  const [pickingImageUri, setPickingImageUri] = useState<string | null>(null);
  const [newImageTitle, setNewImageTitle] = useState('');

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const data = await AsyncStorage.getItem('@ecp_tools_gallery_albums');
      if (data) {
        setAlbums(JSON.parse(data));
      } else {
        // Migrar galería antigua si existe
        const oldGallery = await AsyncStorage.getItem('@ecp_tools_gallery');
        if (oldGallery) {
          const parsed = JSON.parse(oldGallery);
          if (parsed && parsed.length > 0) {
            const migrated: Album = { id: 'default', name: 'Trabajos Anteriores', photos: parsed };
            setAlbums([migrated]);
            await AsyncStorage.setItem('@ecp_tools_gallery_albums', JSON.stringify([migrated]));
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveAlbums = async (newAlbums: Album[]) => {
    setAlbums(newAlbums);
    try {
      await AsyncStorage.setItem('@ecp_tools_gallery_albums', JSON.stringify(newAlbums));
    } catch (e) {}
  };

  const createAlbum = () => {
    if (!newAlbumName.trim()) return;
    const newAlbum: Album = { id: Math.random().toString(36).substr(2, 9), name: newAlbumName, photos: [] };
    saveAlbums([...albums, newAlbum]);
    setNewAlbumName('');
    setModalAlbumVisible(false);
  };

  const deleteAlbum = (id: string) => {
    Alert.alert('Eliminar Carpeta', '¿Borrar esta carpeta y todas sus fotos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => {
        saveAlbums(albums.filter(a => a.id !== id));
      }}
    ]);
  };

  const handlePickGalleryImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso', 'Se requiere acceso a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickingImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso', 'Se requiere acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickingImageUri(result.assets[0].uri);
    }
  };

  const saveGalleryImage = () => {
    if (!pickingImageUri || !activeAlbum) return;
    
    const updatedAlbum = { 
      ...activeAlbum, 
      photos: [...activeAlbum.photos, { uri: pickingImageUri, title: newImageTitle || 'Sin título' }] 
    };
    
    const updatedAlbums = albums.map(a => a.id === activeAlbum.id ? updatedAlbum : a);
    saveAlbums(updatedAlbums);
    setActiveAlbum(updatedAlbum);
    
    setPickingImageUri(null);
    setNewImageTitle('');
  };

  const removeGalleryImage = (index: number) => {
    if (!activeAlbum) return;
    Alert.alert('Eliminar', '¿Borrar esta imagen del álbum?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => {
        const updatedAlbum = { ...activeAlbum, photos: activeAlbum.photos.filter((_, i) => i !== index) };
        const updatedAlbums = albums.map(a => a.id === activeAlbum.id ? updatedAlbum : a);
        saveAlbums(updatedAlbums);
        setActiveAlbum(updatedAlbum);
      }}
    ]);
  };

  if (activeAlbum) {
    return (
      <View style={styles.container}>
        <View style={styles.albumHeaderRow}>
          <TouchableOpacity onPress={() => setActiveAlbum(null)}>
            <Text style={styles.backBtn}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.header}>{activeAlbum.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {pickingImageUri ? (
            <View style={styles.saveImageCard}>
              <Image source={{ uri: pickingImageUri }} style={styles.previewImage} />
              <TextInput style={styles.input} placeholder="Título de la foto..." value={newImageTitle} onChangeText={setNewImageTitle} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setPickingImageUri(null)}><Text style={styles.btnSecondaryText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={saveGalleryImage}><Text style={styles.btnPrimaryText}>Guardar Foto</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.addButtonsRow}>
              <TouchableOpacity style={styles.btnAddPhotoHalf} onPress={handleTakePhoto}>
                <Text style={styles.btnAddPhotoText}>📸 Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAddPhotoHalf} onPress={handlePickGalleryImage}>
                <Text style={styles.btnAddPhotoText}>🖼️ Galería</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.galleryGrid}>
            {activeAlbum.photos.map((img, idx) => (
              <View key={idx} style={styles.galleryItem}>
                <Image source={{ uri: img.uri }} style={styles.galleryImg} />
                <Text style={styles.galleryImgTitle} numberOfLines={1}>{img.title}</Text>
                <TouchableOpacity style={styles.galleryImgDelete} onPress={() => removeGalleryImage(idx)}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            {activeAlbum.photos.length === 0 && !pickingImageUri && (
              <Text style={{ textAlign: 'center', color: colors.textLight, marginTop: 40, width: '100%' }}>Carpeta vacía.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fab} onPress={() => setModalAlbumVisible(true)}>
        <Text style={styles.fabText}>+ Nueva Carpeta</Text>
      </TouchableOpacity>
      
      {albums.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tienes carpetas en tu galería.</Text>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.galleryGrid}>
            {albums.map(album => (
              <TouchableOpacity key={album.id} style={styles.folderCard} onPress={() => setActiveAlbum(album)}>
                <Text style={styles.folderIcon}>📁</Text>
                <Text style={styles.folderTitle} numberOfLines={1}>{album.name}</Text>
                <Text style={styles.folderCount}>{album.photos.length} fotos</Text>
                <TouchableOpacity style={styles.folderDelete} onPress={() => deleteAlbum(album.id)}>
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* MODAL CREAR CARPETA */}
      <Modal visible={modalAlbumVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Nueva Carpeta</Text>
            <TextInput 
              style={styles.input} 
              value={newAlbumName} 
              onChangeText={setNewAlbumName} 
              placeholder="Ej: Trabajos Terminados" 
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setModalAlbumVisible(false)}><Text style={styles.btnSecondaryText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={createAlbum}><Text style={styles.btnPrimaryText}>Crear</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, paddingBottom: 40 },
  header: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  fab: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textLight, fontStyle: 'italic' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  folderCard: { width: '48%', backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 16, alignItems: 'center' },
  folderIcon: { fontSize: 48, marginBottom: 8 },
  folderTitle: { fontSize: 14, fontWeight: 'bold', color: colors.primary, textAlign: 'center' },
  folderCount: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  folderDelete: { position: 'absolute', top: 8, right: 8 },
  
  // Album Detail
  albumHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { color: colors.secondary, fontWeight: 'bold', fontSize: 16 },
  btnAddPhoto: { backgroundColor: colors.secondary, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  addButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  btnAddPhotoHalf: { backgroundColor: colors.secondary, padding: 16, borderRadius: 8, alignItems: 'center', width: '48%' },
  btnAddPhotoText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  // Shared
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 12, marginBottom: 16, color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: colors.card, padding: 24, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 16 },
  btnPrimary: { backgroundColor: colors.primary, padding: 12, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold' },
  btnSecondary: { backgroundColor: colors.border, padding: 12, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  btnSecondaryText: { color: colors.text, fontWeight: 'bold' },

  // Images
  saveImageCard: { backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16, resizeMode: 'cover' },
  galleryItem: { width: '48%', marginBottom: 16, backgroundColor: colors.card, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  galleryImg: { width: '100%', height: 150, resizeMode: 'cover' },
  galleryImgTitle: { padding: 8, fontSize: 12, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  galleryImgDelete: { position: 'absolute', top: 8, right: 8, backgroundColor: 'red', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
