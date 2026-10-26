import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function ToolsExpressCalcScreen() {
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  const [espesor, setEspesor] = useState('');
  
  const [mainCategory, setMainCategory] = useState<'obra_gruesa' | 'terminaciones' | 'especial'>('obra_gruesa');
  const [materialMode, setMaterialMode] = useState<'h20' | 'h30' | 'hormigon_saco' | 'estuco' | 'tabiqueria' | 'techumbre' | 'lineal' | 'albanileria' | 'terminaciones' | 'pintura' | 'tierra' | 'personalizado' | 'exteriores'>('h20');

  // Estado para material personalizado
  const [customLargo, setCustomLargo] = useState('');
  const [customAncho, setCustomAncho] = useState('');

  const l = parseFloat(largo.replace(',', '.')) || 0;
  const a = parseFloat(ancho.replace(',', '.')) || 0;
  const e = parseFloat(espesor.replace(',', '.')) || 0;

  const area = l * a;
  const volumen = area * e;

  const cl = parseFloat(customLargo.replace(',', '.')) || 0;
  const ca = parseFloat(customAncho.replace(',', '.')) || 0;
  const customArea = cl * ca;

  const handleCategoryChange = (cat: 'obra_gruesa' | 'terminaciones' | 'especial') => {
    setMainCategory(cat);
    if (cat === 'obra_gruesa') setMaterialMode('h20');
    if (cat === 'terminaciones') setMaterialMode('tabiqueria');
    if (cat === 'especial') setMaterialMode('personalizado');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.infoText}>Ingresa las medidas para calcular automáticamente Área y Volumen.</Text>
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Largo (m)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={largo} onChangeText={setLargo} placeholder="Ej: 5.5" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ancho/Alto (m)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={ancho} onChangeText={setAncho} placeholder="Ej: 3.2" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Espesor (m)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={espesor} onChangeText={setEspesor} placeholder="Ej: 0.15" />
        </View>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Área: <Text style={styles.bold}>{area > 0 ? area.toFixed(2) : '--'} m²</Text></Text>
        <Text style={styles.summaryText}>Volumen: <Text style={styles.bold}>{volumen > 0 ? volumen.toFixed(3) : '--'} m³</Text></Text>
      </View>

      <Text style={styles.sectionTitle}>Categoría de Trabajo</Text>
      <View style={styles.categoryRow}>
        <TouchableOpacity style={[styles.catBtn, mainCategory === 'obra_gruesa' && styles.catBtnActive]} onPress={() => handleCategoryChange('obra_gruesa')}>
          <Text style={[styles.catBtnText, mainCategory === 'obra_gruesa' && styles.catBtnTextActive]}>🏗️ O. Gruesa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.catBtn, mainCategory === 'terminaciones' && styles.catBtnActive]} onPress={() => handleCategoryChange('terminaciones')}>
          <Text style={[styles.catBtnText, mainCategory === 'terminaciones' && styles.catBtnTextActive]}>🎨 Terminación</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.catBtn, mainCategory === 'especial' && styles.catBtnActive]} onPress={() => handleCategoryChange('especial')}>
          <Text style={[styles.catBtnText, mainCategory === 'especial' && styles.catBtnTextActive]}>⚙️ Otros</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {mainCategory === 'obra_gruesa' && (
          <>
            <TouchableOpacity style={[styles.tab, materialMode === 'h20' && styles.tabActive]} onPress={() => setMaterialMode('h20')}>
              <Text style={[styles.tabText, materialMode === 'h20' && styles.tabTextActive]}>Hormigón H20</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'h30' && styles.tabActive]} onPress={() => setMaterialMode('h30')}>
              <Text style={[styles.tabText, materialMode === 'h30' && styles.tabTextActive]}>Hormigón H30</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'hormigon_saco' && styles.tabActive]} onPress={() => setMaterialMode('hormigon_saco')}>
              <Text style={[styles.tabText, materialMode === 'hormigon_saco' && styles.tabTextActive]}>Hormigón Prep.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'estuco' && styles.tabActive]} onPress={() => setMaterialMode('estuco')}>
              <Text style={[styles.tabText, materialMode === 'estuco' && styles.tabTextActive]}>Estuco</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'albanileria' && styles.tabActive]} onPress={() => setMaterialMode('albanileria')}>
              <Text style={[styles.tabText, materialMode === 'albanileria' && styles.tabTextActive]}>Albañilería</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'techumbre' && styles.tabActive]} onPress={() => setMaterialMode('techumbre')}>
              <Text style={[styles.tabText, materialMode === 'techumbre' && styles.tabTextActive]}>Techumbre (Zinc)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'tierra' && styles.tabActive]} onPress={() => setMaterialMode('tierra')}>
              <Text style={[styles.tabText, materialMode === 'tierra' && styles.tabTextActive]}>Mov. Tierra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'exteriores' && styles.tabActive]} onPress={() => setMaterialMode('exteriores')}>
              <Text style={[styles.tabText, materialMode === 'exteriores' && styles.tabTextActive]}>Exteriores (Patios)</Text>
            </TouchableOpacity>
          </>
        )}

        {mainCategory === 'terminaciones' && (
          <>
            <TouchableOpacity style={[styles.tab, materialMode === 'tabiqueria' && styles.tabActive]} onPress={() => setMaterialMode('tabiqueria')}>
              <Text style={[styles.tabText, materialMode === 'tabiqueria' && styles.tabTextActive]}>Tabiquería Completa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'terminaciones' && styles.tabActive]} onPress={() => setMaterialMode('terminaciones')}>
              <Text style={[styles.tabText, materialMode === 'terminaciones' && styles.tabTextActive]}>Pisos y Cerámica</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'pintura' && styles.tabActive]} onPress={() => setMaterialMode('pintura')}>
              <Text style={[styles.tabText, materialMode === 'pintura' && styles.tabTextActive]}>Pintura y Pastas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, materialMode === 'lineal' && styles.tabActive]} onPress={() => setMaterialMode('lineal')}>
              <Text style={[styles.tabText, materialMode === 'lineal' && styles.tabTextActive]}>Metros Lineales</Text>
            </TouchableOpacity>
          </>
        )}

        {mainCategory === 'especial' && (
          <TouchableOpacity style={[styles.tab, materialMode === 'personalizado' && styles.tabActive]} onPress={() => setMaterialMode('personalizado')}>
            <Text style={[styles.tabText, materialMode === 'personalizado' && styles.tabTextActive]}>+ Material Manual</Text>
          </TouchableOpacity>
        )}
        )}
      </ScrollView>

      {/* RESULTADOS */}
      <View style={styles.resultsBox}>
        {materialMode === 'h20' && volumen > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {volumen.toFixed(2)} m³ de Radier/Cimientos (H20):</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Cemento (Sacos 25kg)</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 12)} sacos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Arena</Text><Text style={styles.resultNum}>{(volumen * 0.5).toFixed(2)} m³</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Gravilla</Text><Text style={styles.resultNum}>{(volumen * 0.8).toFixed(2)} m³</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Agua</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 160)} L</Text></View>
          </>
        )}

        {materialMode === 'h30' && volumen > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {volumen.toFixed(2)} m³ Estructural / Losas (H30):</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Cemento (Sacos 25kg)</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 16)} sacos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Arena</Text><Text style={styles.resultNum}>{(volumen * 0.5).toFixed(2)} m³</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Gravilla</Text><Text style={styles.resultNum}>{(volumen * 0.8).toFixed(2)} m³</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Agua</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 170)} L</Text></View>
          </>
        )}

        {materialMode === 'hormigon_saco' && volumen > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {volumen.toFixed(2)} m³ con Hormigón Premezclado (Seco):</Text>
            <Text style={{color: colors.textLight, fontSize: 12, marginBottom: 8}}>Rendimiento asumido: 12 Litros por saco (0.012 m³)</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Hormigón Prep. (Sacos 25kg)</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 84)} sacos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Agua aprox. para mezcla</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 84 * 2.5)} L</Text></View>
          </>
        )}

        {materialMode === 'estuco' && volumen > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {area.toFixed(2)} m² con espesor de {espesor}m ({volumen.toFixed(2)} m³ de Estuco):</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Cemento (Sacos 25kg)</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 16)} sacos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Arena Fina</Text><Text style={styles.resultNum}>{(volumen * 1.1).toFixed(2)} m³</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Agua</Text><Text style={styles.resultNum}>{Math.ceil(volumen * 200)} L</Text></View>
          </>
        )}

        {materialMode === 'estuco' && area > 0 && volumen === 0 && (
          <Text style={{ textAlign: 'center', color: colors.secondary, fontStyle: 'italic', padding: 20, fontWeight: 'bold' }}>
            Para el estuco, necesitas ingresar el "Espesor" (Ej: 0.02 para 2cm) para calcular el volumen exacto.
          </Text>
        )}

        {materialMode === 'exteriores' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {area.toFixed(2)} m² de Exteriores / Patios:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Adocretos (Clásico 20x10x6cm)</Text><Text style={styles.resultNum}>{Math.ceil(area * 50)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>- ó - Pastelones (50x50cm)</Text><Text style={styles.resultNum}>{Math.ceil(area * 4)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Arena gruesa para cama (3cm esp.)</Text><Text style={styles.resultNum}>{(area * 0.03).toFixed(2)} m³</Text></View>
          </>
        )}

        {materialMode === 'planchas' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {area.toFixed(2)} m² de Revestimiento / Techumbre:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Planchas OSB/Yesocartón (1.22x2.44m)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2.97)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Planchas Zinc Acanalado (Útil 0.85x3m)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2.55)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Piso Flotante (Cajas 2m2)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2.0)} cajas</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Pintura (Manos base, Tinetas 15L)</Text><Text style={styles.resultNum}>{Math.ceil(area / 45)} tin.</Text></View>
          </>
        )}

        {materialMode === 'lineal' && l > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {l.toFixed(2)} metros lineales:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Guardapolvos (3.2m)</Text><Text style={styles.resultNum}>{Math.ceil(l / 3.2)} tiras</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Cornisas (2m)</Text><Text style={styles.resultNum}>{Math.ceil(l / 2)} tiras</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Soleras (1m)</Text><Text style={styles.resultNum}>{Math.ceil(l / 1)} un</Text></View>
          </>
        )}

        {materialMode === 'albanileria' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {area.toFixed(2)} m² de Muros:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Ladrillos (Ej: Princesa 14x29x7)</Text><Text style={styles.resultNum}>{Math.ceil(area * 40)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>- ó - Bloques Hormigón (19x19x39)</Text><Text style={styles.resultNum}>{Math.ceil(area * 12.5)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Mortero de Pega (Sacos 25kg)</Text><Text style={styles.resultNum}>{Math.ceil(area * 0.4)} sacos</Text></View>
            <Text style={styles.disclaimer}>* Considera 40 ladrillos estructurales o 12.5 bloques por m². Mortero de pega aproximado a 10 Litros/m².</Text>
          </>
        )}

        {materialMode === 'techumbre' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Kit Techumbre (Zinc) para {area.toFixed(2)} m²:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Zinc Acanalado (Útil 0.85x3m)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2.55)} planchas</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Tornillos Techo (Hexagonal c/golilla)</Text><Text style={styles.resultNum}>{Math.ceil(area * 5)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Fieltro Asfáltico (Rollo 40m)</Text><Text style={styles.resultNum}>{Math.ceil(area / 36)} rollos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Costaneras (Madera 2x2, separadas a 60cm)</Text><Text style={styles.resultNum}>{Math.ceil(area * 1.6)} ml</Text></View>
          </>
        )}

        {materialMode === 'tabiqueria' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Kit Tabiquería / Volcanita para {area.toFixed(2)} m²:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Planchas Volcanita/Yesocartón (1.2x2.4m)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2.88)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>- ó - Planchas OSB (1.22x2.44m)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2.97)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Tornillos Trompeta / Madera (1 1/4")</Text><Text style={styles.resultNum}>{Math.ceil((area / 2.88) * 30)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Tornillos Lenteja (Metalcon, si aplica)</Text><Text style={styles.resultNum}>{Math.ceil(area * 15)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Huincha para Juntas (Rollo 90m)</Text><Text style={styles.resultNum}>{Math.ceil((area / 2.88) / 30) || 1} rollos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Masilla Base / Pasta para Juntas</Text><Text style={styles.resultNum}>{Math.ceil(area * 0.8)} kg</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Aislante (Lana Mineral / Aislapol)</Text><Text style={styles.resultNum}>{Math.ceil(area)} m²</Text></View>
          </>
        )}

        {materialMode === 'terminaciones' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Kit Pisos y Cerámica para {area.toFixed(2)} m²:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Cerámica/Porcelanato (+10% merma)</Text><Text style={styles.resultNum}>{(area * 1.1).toFixed(2)} m²</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Adhesivo (Bekron, saco 25kg)</Text><Text style={styles.resultNum}>{Math.ceil(area / 5)} sacos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Frague (Bolsas 1kg)</Text><Text style={styles.resultNum}>{Math.ceil(area * 0.3)} un</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Piso Flotante (Cajas de 2m² aprox)</Text><Text style={styles.resultNum}>{Math.ceil(area / 2)} cajas</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Espuma Niveladora (Rollo 10m²)</Text><Text style={styles.resultNum}>{Math.ceil(area / 10)} rollos</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Adhesivo Montaje (Guardapolvos)</Text><Text style={styles.resultNum}>{Math.ceil(area / 15)} tubos</Text></View>
          </>
        )}

        {materialMode === 'pintura' && area > 0 && (
          <>
            <Text style={styles.resultTitle}>Kit Pintura y Muros para {area.toFixed(2)} m²:</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Látex / Esmalte (Tinetas 15L, 2 manos)</Text><Text style={styles.resultNum}>{Math.ceil(area / 40)} tinetas</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>- ó - Látex / Esmalte (Galones 4L, 2 manos)</Text><Text style={styles.resultNum}>{Math.ceil(area / 12)} galones</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Pasta Muro (Tinetas 25kg, 2 manos)</Text><Text style={styles.resultNum}>{Math.ceil(area / 12)} tinetas</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Sellador Acrílico (Galón 4L, 1 mano)</Text><Text style={styles.resultNum}>{Math.ceil(area / 15)} galones</Text></View>
          </>
        )}

        {materialMode === 'tierra' && volumen > 0 && (
          <>
            <Text style={styles.resultTitle}>Para {volumen.toFixed(2)} m³ de Movimiento de Tierra (con {espesor}m de espesor):</Text>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Relleno Base Estabilizada / Compactado (+20% esponjamiento)</Text><Text style={styles.resultNum}>{(volumen * 1.2).toFixed(2)} m³</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultMat}>Arena gruesa para cama de apoyo</Text><Text style={styles.resultNum}>{(volumen * 1.05).toFixed(2)} m³</Text></View>
          </>
        )}

        {materialMode === 'tierra' && area > 0 && volumen === 0 && (
          <Text style={{ textAlign: 'center', color: colors.secondary, fontStyle: 'italic', padding: 20, fontWeight: 'bold' }}>
            Para rellenos y movimientos de tierra, necesitas ingresar el "Espesor" (alto de la capa) para calcular el volumen y esponjamiento.
          </Text>
        )}

        {materialMode === 'personalizado' && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.resultTitle}>Ingresa las medidas de 1 unidad de tu material (Siding, Panel, etc):</Text>
            <View style={[styles.row, { marginBottom: 8 }]}>
              <View style={[styles.inputContainer, { width: '48%' }]}>
                <Text style={styles.label}>Largo del material (m)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={customLargo} onChangeText={setCustomLargo} placeholder="Ej: 3.66" />
              </View>
              <View style={[styles.inputContainer, { width: '48%' }]}>
                <Text style={styles.label}>Ancho/Alto (m)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={customAncho} onChangeText={setCustomAncho} placeholder="Ej: 0.20" />
              </View>
            </View>
            
            {customArea > 0 && area > 0 ? (
              <View style={[styles.resultRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>
                <Text style={styles.resultMat}>Total de unidades necesarias para {area.toFixed(2)} m²:</Text>
                <Text style={[styles.resultNum, { fontSize: 20 }]}>{Math.ceil(area / customArea)} un</Text>
              </View>
            ) : (
              <Text style={{color: colors.textLight, fontStyle: 'italic', marginTop: 8}}>Ingresa las medidas de tu proyecto arriba, y las medidas de una plancha/tabla aquí abajo para calcular.</Text>
            )}
          </View>
        )}

        {((materialMode === 'h20' && volumen === 0) || (materialMode === 'h30' && volumen === 0) || (materialMode === 'hormigon_saco' && volumen === 0) || (materialMode === 'estuco' && area === 0) || (materialMode === 'tabiqueria' && area === 0) || (materialMode === 'techumbre' && area === 0) || (materialMode === 'lineal' && l === 0) || (materialMode === 'albanileria' && area === 0) || (materialMode === 'terminaciones' && area === 0) || (materialMode === 'pintura' && area === 0) || (materialMode === 'tierra' && volumen === 0) || (materialMode === 'exteriores' && area === 0)) && (
          <Text style={{ textAlign: 'center', color: colors.textLight, fontStyle: 'italic', padding: 20 }}>
            Ingresa las medidas arriba para ver el cálculo de materiales.
          </Text>
        )}

        <Text style={styles.disclaimer}>* Cálculos teóricos aproximados sin despunte. Considerar ~10% de pérdida según sea el caso.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  infoText: { color: colors.textLight, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  inputContainer: { width: '31%' },
  label: { fontSize: 12, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 10, textAlign: 'center', color: colors.text },
  summaryBox: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  summaryText: { color: '#fff', fontSize: 16 },
  bold: { fontWeight: 'bold', fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  catBtn: { flex: 1, paddingVertical: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 6, marginHorizontal: 4, alignItems: 'center' },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catBtnText: { color: colors.text, fontSize: 12, fontWeight: 'bold' },
  catBtnTextActive: { color: '#fff' },
  tabsScroll: { flexDirection: 'row', marginBottom: 24, paddingBottom: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: 8, height: 38 },
  tabActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  tabText: { color: colors.text, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  resultsBox: { backgroundColor: '#E0F2FE', padding: 16, borderRadius: 8, marginBottom: 40 },
  resultTitle: { color: colors.primary, fontWeight: 'bold', fontSize: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultMat: { flex: 1, color: colors.text, fontSize: 15, paddingRight: 12 },
  resultNum: { color: colors.secondary, fontWeight: 'bold', fontSize: 16, textAlign: 'right' },
  disclaimer: { fontSize: 11, color: colors.textLight, fontStyle: 'italic', marginTop: 16, textAlign: 'center' },
});
