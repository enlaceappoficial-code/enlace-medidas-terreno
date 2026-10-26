import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Project, Chapter, MeasureItem } from './models';
import { validateLicenseKey, LicenseValidationResult } from '../utils/license';

const DB_FILE = Platform.OS !== 'web' ? (FileSystem.documentDirectory + 'ecp_database_v1.json') : null;
const LIC_FILE = Platform.OS !== 'web' ? (FileSystem.documentDirectory + 'ecp_license_v1.json') : null;
const WEB_KEY = 'ecp_database_v1';
const WEB_LIC_KEY = 'ecp_license_v1';

let RAM_PROJECTS: Project[] | null = null;
let RAM_LICENSE: { key: string, rut?: string | null } | null = null;

const saveDbFile = async (projects: Project[]) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WEB_KEY, JSON.stringify(projects));
      }
      return;
    }
    if (DB_FILE) {
      await FileSystem.writeAsStringAsync(DB_FILE, JSON.stringify(projects), { encoding: FileSystem.EncodingType.UTF8 });
    }
  } catch (error) {
    console.error('Error escribiendo en la base de datos:', error);
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(WEB_KEY);
        if (data) {
          RAM_PROJECTS = JSON.parse(data);
          return RAM_PROJECTS || [];
        }
      }
      RAM_PROJECTS = RAM_PROJECTS || [];
      return RAM_PROJECTS;
    }

    if (DB_FILE) {
      const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
      if (fileInfo.exists) {
        const data = await FileSystem.readAsStringAsync(DB_FILE, { encoding: FileSystem.EncodingType.UTF8 });
        RAM_PROJECTS = JSON.parse(data);
        return RAM_PROJECTS || [];
      }
    }
    RAM_PROJECTS = [];
    return RAM_PROJECTS;
  } catch (e) {
    console.log('Database read error (usando RAM local):', e);
    return RAM_PROJECTS || [];
  }
};

export const saveProject = async (project: Project): Promise<void> => {
  try {
    const projects = await getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) projects[existingIndex] = project;
    else projects.push(project);
    
    RAM_PROJECTS = projects;
    await saveDbFile(projects);
  } catch (e) {
    console.log('Error en saveProject:', e);
  }
};

export const addChapterToProject = async (projectId: string, newChapter: Chapter): Promise<string | null> => {
  try {
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return `No se encontró el proyecto ID: ${projectId}`;
    
    if (!project.capitulos) project.capitulos = [];
    project.capitulos.push(newChapter);
    
    RAM_PROJECTS = projects;
    await saveDbFile(projects);
    return null;
  } catch (e: any) {
    return 'Error interno: ' + e.message;
  }
};

export const addMeasureToChapter = async (projectId: string, chapterId: string, measure: MeasureItem): Promise<string | null> => {
  try {
    const projects = await getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return `No se encontró el proyecto ID: ${projectId}`;
    if (!projects[projectIndex].capitulos) return 'El proyecto no tiene capítulos.';
    
    const chapterIndex = projects[projectIndex].capitulos.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) return `No se encontró el capítulo ID: ${chapterId}`;
    
    if (!projects[projectIndex].capitulos[chapterIndex].partidas) {
      projects[projectIndex].capitulos[chapterIndex].partidas = [];
    }
    
    projects[projectIndex].capitulos[chapterIndex].partidas.push(measure);
    
    RAM_PROJECTS = projects;
    await saveDbFile(projects);
    return null;
  } catch (e: any) {
    return 'Error interno: ' + e.message;
  }
};

export const deleteChapter = async (projectId: string, chapterId: string): Promise<string | null> => {
  try {
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return `No se encontró el proyecto ID: ${projectId}`;
    
    if (project.capitulos) {
      project.capitulos = project.capitulos.filter(c => c.id !== chapterId);
    }
    
    RAM_PROJECTS = projects;
    await saveDbFile(projects);
    return null;
  } catch (e: any) {
    return 'Error interno: ' + e.message;
  }
};

// ==========================================
// GESTIÓN DE LICENCIAS Y LÍMITES COMERCIALES
// ==========================================

export interface LicenseStatus {
  isPro: boolean;
  key: string;
  plan: string;
  planLabel: string;
  fechaVence: string;
  diasRestantes?: number;
  expired?: boolean;
}

export const getLicenseData = async (): Promise<LicenseStatus> => {
  try {
    let rawLic: { key: string, rut?: string | null } | null = null;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(WEB_LIC_KEY);
        if (item) rawLic = JSON.parse(item);
      }
    } else if (LIC_FILE) {
      const info = await FileSystem.getInfoAsync(LIC_FILE);
      if (info.exists) {
        const data = await FileSystem.readAsStringAsync(LIC_FILE, { encoding: FileSystem.EncodingType.UTF8 });
        rawLic = JSON.parse(data);
      }
    }

    if (!rawLic || !rawLic.key) {
      return {
        isPro: false,
        key: '',
        plan: 'gratis',
        planLabel: 'Modo Gratuito (Prueba)',
        fechaVence: 'Ilimitada (2 visitas máx)',
      };
    }

    const val: LicenseValidationResult = validateLicenseKey(rawLic.key, rawLic.rut || null);
    if (val.valid && val.isPro) {
      return {
        isPro: true,
        key: rawLic.key,
        plan: val.plan || 'pro',
        planLabel: `Plan ${val.planLabel || 'Pro'}`,
        fechaVence: val.fecha || '',
        diasRestantes: val.dias,
        expired: false
      };
    } else {
      return {
        isPro: false,
        key: rawLic.key,
        plan: val.plan || 'gratis',
        planLabel: val.expired ? 'Licencia Vencida' : 'Modo Gratuito',
        fechaVence: val.fecha || '',
        diasRestantes: val.dias,
        expired: val.expired
      };
    }
  } catch (e) {
    console.log('Error leyendo licencia:', e);
    return {
      isPro: false,
      key: '',
      plan: 'gratis',
      planLabel: 'Modo Gratuito',
      fechaVence: ''
    };
  }
};

export const saveLicenseKey = async (key: string, rut: string | null = null): Promise<{ success: boolean, message: string, data?: LicenseStatus }> => {
  const val = validateLicenseKey(key, rut);
  if (!val.valid) {
    return { success: false, message: val.reason || 'Clave inválida.' };
  }
  if (val.expired) {
    return { success: false, message: val.reason || 'Esta licencia ya expiró.' };
  }

  const payload = { key: key.toUpperCase().trim(), rut: rut ? rut.trim() : null };

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WEB_LIC_KEY, JSON.stringify(payload));
      }
    } else if (LIC_FILE) {
      await FileSystem.writeAsStringAsync(LIC_FILE, JSON.stringify(payload), { encoding: FileSystem.EncodingType.UTF8 });
    }

    const licData = await getLicenseData();
    return {
      success: true,
      message: `¡Licencia activada con éxito! Bienvenido al Plan ${val.planLabel}.`,
      data: licData
    };
  } catch (e: any) {
    return { success: false, message: 'Error guardando licencia: ' + e.message };
  }
};

export const removeLicense = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(WEB_LIC_KEY);
      }
    } else if (LIC_FILE) {
      await FileSystem.deleteAsync(LIC_FILE, { idempotent: true });
    }
  } catch (e) {
    console.log('Error removiendo licencia:', e);
  }
};

export const canCreateProject = async (): Promise<{ allowed: boolean, count: number, max: number, isPro: boolean }> => {
  const lic = await getLicenseData();
  const projects = await getProjects();
  const max = lic.isPro ? 999999 : 2;
  return {
    allowed: lic.isPro || projects.length < 2,
    count: projects.length,
    max,
    isPro: lic.isPro
  };
};

export const canExportJSON = async (): Promise<{ allowed: boolean, isPro: boolean }> => {
  const lic = await getLicenseData();
  return {
    allowed: lic.isPro,
    isPro: lic.isPro
  };
};
