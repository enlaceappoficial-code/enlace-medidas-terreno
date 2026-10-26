import { Share, Image, Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Project, EcpExport } from '../store/models';

const downloadFileWeb = (filename: string, content: string, mimeType: string) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    Alert.alert('Error Descarga Web', err.message);
  }
};

const downloadBase64Web = (filename: string, base64: string, mimeType: string) => {
  try {
    const a = document.createElement('a');
    a.href = `data:${mimeType};base64,${base64}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err: any) {
    Alert.alert('Error Descarga PDF Web', err.message);
  }
};

export const exportProjectJSON = async (project: Project) => {
  try {
    // 1. Crear clon exacto del proyecto para no alterar la pantalla que el usuario ve
    const cleanProject = JSON.parse(JSON.stringify(project));

    // 2. Limpiar elementos que son exclusivos del celular o rompen el PC
    delete cleanProject.fotos; 
    delete cleanProject.notas; 

    // 3. Limpiar las notas y fotos dentro de cada partida
    if (cleanProject.capitulos) {
      cleanProject.capitulos.forEach(cap => {
        if (cap.partidas) {
          cap.partidas.forEach(p => {
            delete p.fotos;
            delete p.nota;
          });
        }
      });
    }

    const exportData: EcpExport = { origen: 'ECP_MOVIL', proyecto: cleanProject };
    const jsonString = JSON.stringify(exportData, null, 2);
    const safeName = (cleanProject.datosGenerales.descripcionObra || 'proyecto').replace(/[^a-z0-9]/gi, '_');

    if (Platform.OS === 'web') {
      downloadFileWeb(`${safeName}.json`, jsonString, 'application/json');
      return;
    }

    const fileUri = FileSystem.documentDirectory + `${safeName}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
    await shareFile(fileUri, 'application/json');
  } catch (e: any) { 
    Alert.alert('Error JSON', e.message); 
  }
};

export const exportProjectCSV = async (project: Project) => {
  try {
    // Agregar BOM para que Excel reconozca el archivo como UTF-8 y no rompa los tildes
    const BOM = "\uFEFF";
    // Usar punto y coma (;) porque en la región de habla hispana Excel usa coma (,) para los decimales
    let csv = BOM + "Capitulo;Partida;Tipo;Largo;Ancho;Alto;Cantidad;Unidad;Nota\n";
    
    (project.capitulos || []).forEach(cap => {
      (cap.partidas || []).forEach(p => {
        const pL = p.detalles?.largo !== undefined ? p.detalles.largo : '';
        const pA = p.detalles?.ancho !== undefined ? p.detalles.ancho : '';
        const pH = p.detalles?.alto !== undefined ? p.detalles.alto : '';
        const desc = `"${p.descripcion.replace(/"/g, '""')}"`;
        const nota = `"${(p.nota || '').replace(/"/g, '""')}"`;
        const capNom = `"${cap.nombre.replace(/"/g, '""')}"`;
        
        // Reemplazar puntos por comas para que Excel los tome como números reales en nuestra región
        let lStr = String(pL).replace('.', ',');
        let aStr = String(pA).replace('.', ',');
        let hStr = String(pH).replace('.', ',');
        let cStr = String(p.cantidad).replace('.', ',');
        
        csv += `${capNom};${desc};${p.tipo_medida};${lStr};${aStr};${hStr};${cStr};${p.unidad};${nota}\n`;
      });
    });

    const safeName = (project.datosGenerales.descripcionObra || 'proyecto').replace(/[^a-z0-9]/gi, '_');

    if (Platform.OS === 'web') {
      downloadFileWeb(`${safeName}.csv`, csv, 'text/csv;charset=utf-8;');
      return;
    }

    const fileUri = FileSystem.documentDirectory + `${safeName}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await shareFile(fileUri, 'text/csv');
  } catch (e: any) { Alert.alert('Error CSV', e.message); }
};

export const exportProjectPDF = async (project: Project) => {
  try {
    const logoAsset = require('../../assets/logo fondo blanco.png');
    const logoUri = Image.resolveAssetSource(logoAsset).uri;

    let html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            .header-container { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
            .logo { max-width: 150px; max-height: 80px; object-fit: contain; }
            .title-box { text-align: right; }
            h1 { color: #0284c7; margin: 0; font-size: 24px; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .client-notes { background: #f8fafc; padding: 15px; border-left: 4px solid #0284c7; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f1f5f9; color: #0f172a; }
            .chapter-title { background-color: #e0f2fe; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <img class="logo" src="${logoUri}" />
            </div>
            <div class="title-box">
              <h1>${project.datosGenerales.descripcionObra || 'Presupuesto'}</h1>
              <div class="subtitle">
                Cliente: ${project.datosGenerales.cliente}<br>
                Fecha: ${project.datosGenerales.fecha}
              </div>
            </div>
          </div>
    `;

    if (project.datosGenerales.notasCliente) {
      html += `
          <div class="client-notes">
            <strong>Notas Generales:</strong><br>
            ${project.datosGenerales.notasCliente.replace(/\n/g, '<br>')}
          </div>
      `;
    }

    html += `<table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Medidas</th>
          <th>Total</th>
          <th>Unid.</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>
    `;

    for (const cap of (project.capitulos || [])) {
      html += `
        <tr class="chapter-title">
          <td colspan="5">🏗️ ${cap.nombre}</td>
        </tr>
      `;
      if (!cap.partidas || cap.partidas.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Sin mediciones</td></tr>`;
      } else {
        for (const p of cap.partidas) {
          const dim = [];
          if (p.detalles?.largo !== undefined && p.detalles.largo !== '') dim.push(`L:${p.detalles.largo}`);
          if (p.detalles?.ancho !== undefined && p.detalles.ancho !== '') dim.push(`A:${p.detalles.ancho}`);
          if (p.detalles?.alto !== undefined && p.detalles.alto !== '') dim.push(`H:${p.detalles.alto}`);
          const dimStr = dim.join(' x ') || '-';
          
          html += `
            <tr>
              <td>${p.descripcion}</td>
              <td>${dimStr}</td>
              <td><strong>${p.cantidad}</strong></td>
              <td>${p.unidad}</td>
              <td>${p.nota || ''}</td>
            </tr>
          `;

          if (p.fotos && p.fotos.length > 0) {
            let fotosHtml = '';
            for (const fUri of p.fotos) {
               try {
                 if (Platform.OS === 'web') {
                   fotosHtml += `<img src="${fUri}" style="height: 60px; margin-right: 8px; border-radius: 4px; border: 1px solid #ccc;" />`;
                 } else {
                   const b64 = await FileSystem.readAsStringAsync(fUri, { encoding: FileSystem.EncodingType.Base64 });
                   const mime = fUri.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
                   fotosHtml += `<img src="data:image/${mime};base64,${b64}" style="height: 60px; margin-right: 8px; border-radius: 4px; border: 1px solid #ccc;" />`;
                 }
               } catch(e) {
                 fotosHtml += `<span style="color:red; font-size:10px;">[Error foto]</span>`;
               }
            }
            html += `<tr><td colspan="5" style="padding-top: 4px; padding-bottom: 8px; background-color: #fafafa;">${fotosHtml}</td></tr>`;
          }
        }
      }
    }

    html += `
      </tbody>
      </table>
      </body>
      </html>
    `;

    const safeName = (project.datosGenerales.descripcionObra || 'proyecto').replace(/[^a-z0-9]/gi, '_');

    if (Platform.OS === 'web') {
      try {
        const { base64 } = await Print.printToFileAsync({ html, base64: true });
        if (base64) {
          downloadBase64Web(`${safeName}.pdf`, base64, 'application/pdf');
        } else {
          await Print.printAsync({ html });
        }
      } catch (err) {
        await Print.printAsync({ html });
      }
      return;
    }

    const { base64 } = await Print.printToFileAsync({ html, base64: true });
    const fileUri = FileSystem.documentDirectory + `${safeName}.pdf`;
    
    if (base64) {
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      await shareFile(fileUri, 'application/pdf');
    } else {
      throw new Error('No se pudo codificar el PDF.');
    }
  } catch (e: any) { Alert.alert('Error PDF', e.message); }
};

const shareFile = async (fileUri: string, mimeType: string) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, { UTI: mimeType, mimeType, dialogTitle: 'Exportar Proyecto' });
    } else {
      Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo o simulador.');
    }
  } catch (e: any) {
    Alert.alert('Error al compartir', e.message || String(e));
  }
};

export const exportProjectText = async (project: Project) => {
  let text = `🏗️ PROYECTO: ${project.datosGenerales.descripcionObra || 'Sin título'}
👤 CLIENTE: ${project.datosGenerales.cliente || 'Sin cliente'}
📅 FECHA: ${project.datosGenerales.fecha || ''}
`;

  if (project.datosGenerales.notasCliente) {
    text += `
📝 NOTAS GENERALES:
${project.datosGenerales.notasCliente}
`;
  }

  text += `
==========================
📦 MEDICIONES Y PARTIDAS
==========================
`;

  if (!project.capitulos || project.capitulos.length === 0) {
    text += `
No hay capítulos guardados.`;
  } else {
    project.capitulos.forEach(cap => {
      text += `
▶️ ${cap.nombre.toUpperCase()}
`;
      
      if (!cap.partidas || cap.partidas.length === 0) {
        text += `   Sin mediciones.
`;
      } else {
        cap.partidas.forEach(p => {
          text += `   - ${p.descripcion}: ${p.cantidad} ${p.unidad}
`;
          
          const dim = [];
          if (p.detalles?.largo) dim.push(`L:${p.detalles.largo}`);
          if (p.detalles?.ancho) dim.push(`A:${p.detalles.ancho}`);
          if (p.detalles?.alto) dim.push(`H:${p.detalles.alto}`);
          if (dim.length > 0) {
            text += `     (Desglose: ${dim.join(' x ')})
`;
          }

          if (p.nota) {
            text += `     Nota: ${p.nota}
`;
          }
        });
      }
    });
  }

  try {
    await Share.share({ message: text });
  } catch (error) {
    console.log('Error sharing text', error);
  }
};
