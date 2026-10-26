import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function ToolsNotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  
  // States for active note
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('@ecp_tools_notes_list');
      if (data) {
        setNotes(JSON.parse(data));
      } else {
        // Migrar nota antigua si existe
        const oldNote = await AsyncStorage.getItem('@ecp_tools_notes');
        if (oldNote && oldNote.trim() !== '') {
          const migrated: Note = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Nota Anterior',
            content: oldNote,
            date: new Date().toLocaleDateString()
          };
          setNotes([migrated]);
          await AsyncStorage.setItem('@ecp_tools_notes_list', JSON.stringify([migrated]));
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    try {
      await AsyncStorage.setItem('@ecp_tools_notes_list', JSON.stringify(newNotes));
    } catch (e) {}
  };

  const createNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nueva Nota',
      content: '',
      date: new Date().toLocaleDateString()
    };
    setActiveNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const openNote = (n: Note) => {
    setActiveNote(n);
    setTitle(n.title);
    setContent(n.content);
  };

  const saveActiveNote = () => {
    if (!activeNote) return;
    
    let updatedList = [...notes];
    const index = updatedList.findIndex(n => n.id === activeNote.id);
    
    const updatedNote = { ...activeNote, title: title || 'Sin título', content };
    
    if (index >= 0) {
      updatedList[index] = updatedNote;
    } else {
      updatedList = [updatedNote, ...updatedList];
    }
    
    saveNotes(updatedList);
    setActiveNote(null);
  };

  const deleteNote = (id: string) => {
    Alert.alert('Eliminar', '¿Borrar esta nota permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => {
        saveNotes(notes.filter(n => n.id !== id));
      }}
    ]);
  };

  if (activeNote) {
    return (
      <View style={styles.container}>
        <TextInput 
          style={styles.titleInput} 
          value={title} 
          onChangeText={setTitle} 
          placeholder="Título de la nota..."
          autoFocus
        />
        <TextInput 
          style={styles.contentInput} 
          value={content} 
          onChangeText={setContent} 
          multiline
          placeholder="Escribe el contenido aquí..."
        />
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setActiveNote(null)}>
            <Text style={styles.btnSecondaryText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={saveActiveNote}>
            <Text style={styles.btnPrimaryText}>Guardar Nota</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fab} onPress={createNote}>
        <Text style={styles.fabText}>+ Nueva Nota</Text>
      </TouchableOpacity>
      
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tienes notas guardadas.</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard} onPress={() => openNote(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>{item.content || 'Sin contenido'}</Text>
                <Text style={styles.noteDate}>{item.date}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNote(item.id)}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, paddingBottom: 40 },
  fab: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textLight, fontStyle: 'italic' },
  noteCard: { backgroundColor: colors.card, padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  noteTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  notePreview: { fontSize: 13, color: colors.textLight, marginBottom: 8 },
  noteDate: { fontSize: 11, color: colors.secondary },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 18 },
  titleInput: { fontSize: 20, fontWeight: 'bold', color: colors.primary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12, marginBottom: 16 },
  contentInput: { flex: 1, fontSize: 16, color: colors.text, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btnPrimary: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, flex: 0.48, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold' },
  btnSecondary: { backgroundColor: colors.border, padding: 16, borderRadius: 8, flex: 0.48, alignItems: 'center' },
  btnSecondaryText: { color: colors.text, fontWeight: 'bold' },
});
