import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { MeasureType, MeasureItem } from '../store/models';
import { addMeasureToChapter } from '../store/storage';

export default function CalculatorScreen({ route, navigation }: any) {
  const { projectId, capituloId } = route.params || {};

  const [descripcion, setDescripcion] = useState('');
  const [nota, setNota] = useState('');
  const [tipo, setTipo] = useState<MeasureType>('area');
  
  // Variables para cálculo
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  
  // Fotos de respaldo (máximo 6)
  const [fotos, setFotos] = useState<string[]>([]);

  const calcularTotal = () => {
    const l = parseFloat(largo) || 0;
    const a = parseFloat(ancho) || 0;
    
    if (tipo === 'lineal') return l;
    if (tipo === 'area') return l * a;
    return 0;
  };

  const handleTomarFoto = async () => {
    if (fotos.length >= 6) {
      Alert.alert('Límite de fotos', 'Puedes agregar un máximo de 6 fotos por partida.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar fotos de respaldo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemoverFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    if (!descripcion) {
      Alert.alert('Faltan Datos', 'Debes ponerle un nombre o descripción a la medición.');
      return;
    }

    const newMeasure: MeasureItem = {
      id: Math.random().toString(36).substr(2, 9),
      descripcion,
      tipo_medida: tipo,
      cantidad: calcularTotal(),
      unidad: tipo === 'lineal' ? 'ml' : 'm2',
      nota: nota || undefined,
      fotos: fotos.length > 0 ? fotos : undefined,
    };

    if (projectId && capituloId) {
      const errorMsg = await addMeasureToChapter(projectId, capituloId, newMeasure);
      if (errorMsg) {
        Alert.alert('Error Fatal', errorMsg);
        return;
      }
    } else {
      Alert.alert('Error Fatal', 'No se recibieron los IDs de proyecto o capítulo.');
      return;
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 300 }} // Espacio gigante
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Nombre de la Medición (Partida)</Text>
        <TextInput 
          style={styles.input} 
          value={descripcion} 
          onChangeText={setDescripcion} 
          placeholder="Ej: Muro Norte" 
        />

        <Text style={styles.label}>Tipo de Medición</Text>
        <View style={styles.typeContainer}>
          {['lineal', 'area', 'irregular'].map((t) => (
            <TouchableOpacity 
              key={t}
              style={[styles.typeButton, tipo === t && styles.typeButtonActive]}
              onPress={() => setTipo(t as MeasureType)}
            >
              <Text style={[styles.typeText, tipo === t && styles.typeTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.calculatorCard}>
          {tipo === 'lineal' && (
            <View>
              <Text style={styles.label}>Largo (metros)</Text>
              <TextInput style={styles.input} value={largo} onChangeText={setLargo} keyboardType="numeric" />
            </View>
          )}

          {tipo === 'area' && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Largo (m)</Text>
                <TextInput style={styles.input} value={largo} onChangeText={setLargo} keyboardType="numeric" />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Alto/Ancho (m)</Text>
                <TextInput style={styles.input} value={ancho} onChangeText={setAncho} keyboardType="numeric" />
              </View>
            </View>
          )}

          {tipo === 'irregular' && (
            <View>
               <Text style={styles.infoText}>La calculadora de polígono irregular requiere dibujar los lados (en desarrollo).</Text>
            </View>
          )}

          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Total Calculado:</Text>
            <Text style={styles.resultValue}>{calcularTotal().toFixed(2)} {tipo === 'lineal' ? 'ml' : 'm2'}</Text>
          </View>
        </View>

        {/* Nota de la medición */}
        <Text style={styles.label}>Nota u Observación (Exportable)</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={nota} 
          onChangeText={setNota} 
          placeholder="Ej: Hay filtraciones en la esquina, considerar extra..." 
          multiline
        />

        {/* Galería de Fotos */}
        <View style={styles.photoHeader}>
          <Text style={styles.label}>Fotos de Respaldo ({fotos.length}/6)</Text>
        </View>
        
        {fotos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {fotos.map((uri, index) => (
              <View key={index} style={styles.photoThumbnailContainer}>
                <Image source={{ uri }} style={styles.photoThumbnail} />
                <TouchableOpacity style={styles.btnRemovePhoto} onPress={() => handleRemoverFoto(index)}>
                  <Text style={styles.btnRemovePhotoText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {fotos.length < 6 && (
          <TouchableOpacity style={styles.photoButton} onPress={handleTomarFoto}>
            <Text style={styles.photoButtonText}>📸 Agregar Foto</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar Medición</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  label: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 4,
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  typeTextActive: {
    color: '#fff',
  },
  calculatorCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 0.48,
  },
  resultBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E0F2FE', // Un azul muy claro
    borderRadius: 6,
    alignItems: 'center',
  },
  resultTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  infoText: {
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoThumbnailContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnRemovePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  btnRemovePhotoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  photoButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  photoButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 64, // Elevado
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
