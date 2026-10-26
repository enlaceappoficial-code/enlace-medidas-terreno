import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Project, Chapter, MeasureItem } from './models';

const DB_FILE = Platform.OS !== 'web' ? (FileSystem.documentDirectory + 'ecp_database_v1.json') : null;
const WEB_KEY = 'ecp_database_v1';
let RAM_PROJECTS: Project[] | null = null;

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
