import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import ExportToProjectModal from '../components/ExportToProjectModal';

export default function ToolsLayoutCalcScreen() {
  const [mode, setMode] = useState<'terreno' | 'pendiente' | 'escuadra' | 'conversor'>('terreno');
  const [l1, setL1] = useState('');
  const [l2, setL2] = useState('');
  const [l3, setL3] = useState('');
  const [triangulos, setTriangulos] = useState<{l1: number, l2: number, l3: number, area: number}[]>([]);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportData, setExportData] = useState<{descripcion: string, cantidad: number, unidad: string, tipo_medida: 'area'|'volumen'|'lineal'|'unidad'} | null>(null);
  const [convMode, setConvMode] = useState<'longitud' | 'volumen' | 'peso'>('longitud');

  // Estados Pendiente
  const [distanciaPendiente, setDistanciaPendiente] = useState('');
  const [porcentajePendiente, setPorcentajePendiente] = useState('');
  
  // Estados Escuadra
  const [ladoA, setLadoA] = useState('');
  const [ladoB, setLadoB] = useState('');

  // Estados Conversor
  const [convInput, setConvInput] = useState('');

  // Cálculos Terreno
  const currentL1 = parseFloat(l1.replace(',', '.')) || 0;
  const currentL2 = parseFloat(l2.replace(',', '.')) || 0;
  const currentL3 = parseFloat(l3.replace(',', '.')) || 0;
  
  let currentArea = 0;
  let currentErr = '';
  if (currentL1 && currentL2 && currentL3) {
    const s = (currentL1 + currentL2 + currentL3) / 2;
    currentArea = Math.sqrt(s * (s - currentL1) * (s - currentL2) * (s - currentL3));
    if (isNaN(currentArea) || currentArea <= 0) currentErr = 'El triángulo no cierra. Medidas inválidas.';
  }

  const areaTotalTriangulos = triangulos.reduce((sum, t) => sum + t.area, 0);

  const agregarTriangulo = () => {
    if (currentArea > 0 && !currentErr) {
      setTriangulos([...triangulos, { l1: currentL1, l2: currentL2, l3: currentL3, area: currentArea }]);
      setL1(''); setL2(''); setL3('');
    }
  };

  const eliminarTriangulo = (index: number) => {
    const nuevos = [...triangulos];
    nuevos.splice(index, 1);
    setTriangulos(nuevos);
  };

  // Cálculos Pendiente
  const distP = parseFloat(distanciaPendiente.replace(',', '.')) || 0;
  const porcP = parseFloat(porcentajePendiente.replace(',', '.')) || 0;
  const desnivelCm = (distP * (porcP / 100)) * 100; // a cm

  // Cálculos Escuadra
  const a = parseFloat(ladoA.replace(',', '.')) || 0;
  const b = parseFloat(ladoB.replace(',', '.')) || 0;
  const diagonal = Math.sqrt((a * a) + (b * b));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, mode === 'terreno' && styles.tabActive]} onPress={() => setMode('terreno')}>
              <Text style={[styles.tabText, mode === 'terreno' && styles.tabTextActive]}>⛰️ Terrenos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'pendiente' && styles.tabActive]} onPress={() => setMode('pendiente')}>
              <Text style={[styles.tabText, mode === 'pendiente' && styles.tabTextActive]}>📏 Pendientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'escuadra' && styles.tabActive]} onPress={() => setMode('escuadra')}>
              <Text style={[styles.tabText, mode === 'escuadra' && styles.tabTextActive]}>📐 Escuadra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'conversor' && styles.tabActive]} onPress={() => setMode('conversor')}>
              <Text style={[styles.tabText, mode === 'conversor' && styles.tabTextActive]}>🔄 Conversor</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {mode === 'terreno' && (
          <View style={styles.card}>
            <Text style={styles.title}>Sumador de Triángulos (Herón)</Text>
            <Text style={styles.description}>Divide tu terreno irregular en triángulos. Ingresa las medidas de cada uno y súmalos para obtener el área total.</Text>
            
            <View style={{backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, marginBottom: 15, alignItems: 'center'}}>
              <Text style={{fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: '#334155', lineHeight: 18}}>
{`   Lado 2
    /\\ 
   /  \\ Lado 3
  /    \\
 ────────
  Lado 1`}
              </Text>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1, marginRight: 4}}>
                <Text style={styles.label}>Lado 1</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={l1} onChangeText={setL1} placeholder="Ej: 5" />
              </View>
              <View style={{flex: 1, marginHorizontal: 4}}>
                <Text style={styles.label}>Lado 2</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={l2} onChangeText={setL2} placeholder="Ej: 4" />
              </View>
              <View style={{flex: 1, marginLeft: 4}}>
                <Text style={styles.label}>Lado 3</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={l3} onChangeText={setL3} placeholder="Ej: 6" />
              </View>
            </View>

            {currentErr ? <Text style={{color: 'red', textAlign: 'center', marginBottom: 10}}>{currentErr}</Text> : null}

            <TouchableOpacity 
              style={{backgroundColor: currentArea > 0 ? colors.primary : '#94a3b8', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 20}}
              disabled={currentArea === 0}
              onPress={agregarTriangulo}
            >
              <Text style={{color: '#fff', fontWeight: 'bold'}}>➕ Agregar Triángulo ({currentArea > 0 ? currentArea.toFixed(2) : '0.00'} m²)</Text>
            </TouchableOpacity>

            {triangulos.length > 0 && (
              <View style={{backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#e2e8f0'}}>
                <Text style={{fontWeight: 'bold', color: colors.primary, marginBottom: 10}}>Triángulos Añadidos:</Text>
                {triangulos.map((t, idx) => (
                  <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 6, alignItems: 'center'}}>
                    <Text style={{fontSize: 13, color: '#475569'}}>#{idx+1} ({t.l1}x{t.l2}x{t.l3}m)</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{fontWeight: 'bold', color: colors.secondary, marginRight: 10}}>{t.area.toFixed(2)} m²</Text>
                      <TouchableOpacity onPress={() => eliminarTriangulo(idx)}>
                        <Text style={{color: 'red', fontWeight: 'bold', fontSize: 16}}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#e2e8f0'}}>
                  <Text style={{fontWeight: 'bold', fontSize: 16}}>Área Total Terreno:</Text>
                  <Text style={{fontWeight: 'bold', fontSize: 18, color: colors.primary}}>{areaTotalTriangulos.toFixed(2)} m²</Text>
                </View>
                
                <TouchableOpacity 
                  style={{backgroundColor: '#10b981', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 15}}
                  onPress={() => {
                    setExportData({
                      descripcion: 'Trazado Terreno (Fórmula Herón)',
                      cantidad: parseFloat(areaTotalTriangulos.toFixed(2)),
                      unidad: 'm2',
                      tipo_medida: 'area'
                    });
                    setIsExportModalVisible(true);
                  }}
                >
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>🏗️ Enviar a Proyecto</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        
        

        {mode === 'pendiente' && (
          <View style={styles.card}>
            <Text style={styles.title}>Cálculo de Desnivel</Text>
            <Text style={styles.description}>Ideal para trazado de alcantarillado, desagües y caída de techumbres.</Text>
            
            <Text style={styles.label}>Distancia Horizontal (metros)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={distanciaPendiente} onChangeText={setDistanciaPendiente} placeholder="Ej: 5.0" />

            <Text style={styles.label}>Pendiente Requerida (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={porcentajePendiente} onChangeText={setPorcentajePendiente} placeholder="Ej: 3 (Alcantarillado común)" />

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Desnivel a bajar:</Text>
              <Text style={styles.resultValue}>{desnivelCm.toFixed(1)} cm</Text>
            </View>
            <Text style={styles.hint}>* Si tu zanja mide {distP || 'X'} metros, el punto final debe estar {desnivelCm.toFixed(1)} centímetros más abajo que el punto de inicio para lograr un {porcP || 'Y'}% de caída.</Text>
          </View>
        )}

        {mode === 'escuadra' && (
          <View style={styles.card}>
            <Text style={styles.title}>Escuadra Perfecta (Pitágoras)</Text>
            <Text style={styles.description}>Asegura que las esquinas de tu radier o muros tengan exactamente 90 grados.</Text>
            
            <Text style={styles.label}>Muro / Lado A (metros)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={ladoA} onChangeText={setLadoA} placeholder="Ej: 3.0" />

            <Text style={styles.label}>Muro / Lado B (metros)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={ladoB} onChangeText={setLadoB} placeholder="Ej: 4.0" />

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>La Diagonal debe medir:</Text>
              <Text style={styles.resultValue}>{diagonal.toFixed(3)} m</Text>
            </View>
            <Text style={styles.hint}>* Si cruzas tu huincha desde la punta del Lado A hasta la punta del Lado B, debe medir exactamente {diagonal.toFixed(3)} metros para que la esquina sea perfectamente cuadrada.</Text>
          </View>
        )}

        {mode === 'conversor' && (
          <View style={styles.card}>
            <Text style={styles.title}>Conversor de Unidades</Text>
            <Text style={styles.description}>Ingresa un valor para ver sus conversiones automáticas.</Text>
            
            <View style={styles.convTabs}>
              <TouchableOpacity style={[styles.convTab, convMode === 'longitud' && styles.convTabActive]} onPress={() => setConvMode('longitud')}><Text style={[styles.convTabText, convMode === 'longitud' && styles.convTabTextActive]}>📏 Longitud</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.convTab, convMode === 'volumen' && styles.convTabActive]} onPress={() => setConvMode('volumen')}><Text style={[styles.convTabText, convMode === 'volumen' && styles.convTabTextActive]}>💧 Volumen</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.convTab, convMode === 'peso' && styles.convTabActive]} onPress={() => setConvMode('peso')}><Text style={[styles.convTabText, convMode === 'peso' && styles.convTabTextActive]}>⚖️ Peso</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>Valor a convertir</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={convInput} onChangeText={setConvInput} placeholder="Ej: 15" />

            {convInput !== '' && (
              <View style={styles.convResults}>
                {convMode === 'longitud' && (
                  <>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Pulgadas a Centímetros</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 2.54).toFixed(2)} cm</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Pies a Metros</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 0.3048).toFixed(2)} m</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Centímetros a Pulgadas</Text><Text style={styles.convVal}>{(parseFloat(convInput) / 2.54).toFixed(2)} in</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Metros a Pies</Text><Text style={styles.convVal}>{(parseFloat(convInput) / 0.3048).toFixed(2)} ft</Text></View>
                  </>
                )}
                {convMode === 'volumen' && (
                  <>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Litros a Cent. Cúbicos</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 1000).toFixed(2)} cc</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Litros a Metros Cúbicos</Text><Text style={styles.convVal}>{(parseFloat(convInput) / 1000).toFixed(4)} m³</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Metros Cúbicos a Litros</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 1000).toFixed(2)} L</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Galones a Litros</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 3.78541).toFixed(2)} L</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Litros a Galones</Text><Text style={styles.convVal}>{(parseFloat(convInput) / 3.78541).toFixed(2)} gal</Text></View>
                  </>
                )}
                {convMode === 'peso' && (
                  <>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Kilos a Gramos</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 1000).toFixed(2)} g</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Gramos a Kilos</Text><Text style={styles.convVal}>{(parseFloat(convInput) / 1000).toFixed(4)} kg</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Kilos a Libras</Text><Text style={styles.convVal}>{(parseFloat(convInput) * 2.20462).toFixed(2)} lb</Text></View>
                    <View style={styles.convRow}><Text style={styles.convLabel}>{convInput} Libras a Kilos</Text><Text style={styles.convVal}>{(parseFloat(convInput) / 2.20462).toFixed(2)} kg</Text></View>
                  </>
                )}
              </View>
            )}
          </View>
        )}

      </ScrollView>
    
      <ExportToProjectModal 
        visible={isExportModalVisible} 
        onClose={() => setIsExportModalVisible(false)} 
        exportData={exportData} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.border },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textLight, fontWeight: 'bold' },
  tabTextActive: { color: colors.primary },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  description: { fontSize: 13, color: colors.textLight, marginBottom: 20, fontStyle: 'italic' },
  label: { fontWeight: '600', color: colors.primary, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 16 },
  resultBox: { backgroundColor: '#E0F2FE', padding: 16, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  resultLabel: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  resultValue: { color: colors.secondary, fontWeight: 'bold', fontSize: 32, marginTop: 4 },
  hint: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 8 },
  convTabs: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 8, padding: 4, marginBottom: 16 },
  convTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  convTabActive: { backgroundColor: colors.card, elevation: 1 },
  convTabText: { fontSize: 12, color: colors.textLight, fontWeight: 'bold' },
  convTabTextActive: { color: colors.primary },
  convResults: { backgroundColor: colors.background, borderRadius: 8, padding: 12, marginTop: 8 },
  convRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  convLabel: { fontSize: 13, color: colors.text, flex: 1 },
  convVal: { fontSize: 14, fontWeight: 'bold', color: colors.secondary, textAlign: 'right', flex: 0.8 }
});
