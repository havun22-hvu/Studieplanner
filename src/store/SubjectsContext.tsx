import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import { useAuth } from './AuthContext';
import type { Subject, StudyTask } from '@/types';

interface SubjectsContextType {
  subjects: Subject[];
  isLoading: boolean;
  addSubject: (data: Omit<Subject, 'id' | 'tasks'>) => Promise<Subject>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTask: (subjectId: string, data: Omit<StudyTask, 'id' | 'subjectId' | 'completed'>) => Promise<StudyTask>;
  updateTask: (taskId: string, data: Partial<StudyTask>) => Promise<void>;
  deleteTask: (subjectId: string, taskId: string) => Promise<void>;
  toggleTaskCompleted: (subjectId: string, taskId: string) => Promise<void>;
  refreshSubjects: () => Promise<void>;
  getSubject: (id: string) => Subject | undefined;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load subjects on mount and when auth changes
  useEffect(() => {
    async function loadSubjects() {
      setIsLoading(true);
      try {
        // First load from local storage
        const localSubjects = await storage.getSubjects();
        if (localSubjects.length > 0) {
          setSubjects(localSubjects);
        }

        // If authenticated, sync with server
        if (isAuthenticated) {
          try {
            const serverSubjects = await api.getSubjects();
            setSubjects(serverSubjects);
            await storage.setSubjects(serverSubjects);
          } catch (error) {
            console.error('Error fetching subjects from server:', error);
          }
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();
  }, [isAuthenticated]);

  const saveSubjects = useCallback(async (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    await storage.setSubjects(newSubjects);
  }, []);

  const addSubject = useCallback(async (data: Omit<Subject, 'id' | 'tasks'>): Promise<Subject> => {
    const newSubject: Subject = {
      ...data,
      id: uuidv4(),
      tasks: [],
    };

    const newSubjects = [...subjects, newSubject];
    await saveSubjects(newSubjects);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        const serverSubject = await api.createSubject(data);
        // Update with server ID
        const updatedSubjects = newSubjects.map(s =>
          s.id === newSubject.id ? { ...s, id: serverSubject.id } : s
        );
        await saveSubjects(updatedSubjects);
        return serverSubject;
      } catch (error) {
        console.error('Error creating subject on server:', error);
      }
    }

    return newSubject;
  }, [subjects, isAuthenticated, saveSubjects]);

  const updateSubject = useCallback(async (id: string, data: Partial<Subject>) => {
    const newSubjects = subjects.map(s =>
      s.id === id ? { ...s, ...data } : s
    );
    await saveSubjects(newSubjects);

    if (isAuthenticated) {
      try {
        await api.updateSubject(id, data);
      } catch (error) {
        console.error('Error updating subject on server:', error);
      }
    }
  }, [subjects, isAuthenticated, saveSubjects]);

  const deleteSubject = useCallback(async (id: string) => {
    const newSubjects = subjects.filter(s => s.id !== id);
    await saveSubjects(newSubjects);

    if (isAuthenticated) {
      try {
        await api.deleteSubject(id);
      } catch (error) {
        console.error('Error deleting subject on server:', error);
      }
    }
  }, [subjects, isAuthenticated, saveSubjects]);

  const addTask = useCallback(async (
    subjectId: string,
    data: Omit<StudyTask, 'id' | 'subjectId' | 'completed'>
  ): Promise<StudyTask> => {
    const newTask: StudyTask = {
      ...data,
      id: uuidv4(),
      subjectId,
      completed: false,
    };

    const newSubjects = subjects.map(s =>
      s.id === subjectId
        ? { ...s, tasks: [...s.tasks, newTask] }
        : s
    );
    await saveSubjects(newSubjects);

    if (isAuthenticated) {
      try {
        const serverTask = await api.createTask(subjectId, data);
        // Update with server ID
        const updatedSubjects = newSubjects.map(s =>
          s.id === subjectId
            ? {
                ...s,
                tasks: s.tasks.map(t =>
                  t.id === newTask.id ? { ...t, id: serverTask.id } : t
                ),
              }
            : s
        );
        await saveSubjects(updatedSubjects);
        return serverTask;
      } catch (error) {
        console.error('Error creating task on server:', error);
      }
    }

    return newTask;
  }, [subjects, isAuthenticated, saveSubjects]);

  const updateTask = useCallback(async (taskId: string, data: Partial<StudyTask>) => {
    const newSubjects = subjects.map(s => ({
      ...s,
      tasks: s.tasks.map(t =>
        t.id === taskId ? { ...t, ...data } : t
      ),
    }));
    await saveSubjects(newSubjects);

    if (isAuthenticated) {
      try {
        await api.updateTask(taskId, data);
      } catch (error) {
        console.error('Error updating task on server:', error);
      }
    }
  }, [subjects, isAuthenticated, saveSubjects]);

  const deleteTask = useCallback(async (subjectId: string, taskId: string) => {
    const newSubjects = subjects.map(s =>
      s.id === subjectId
        ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
        : s
    );
    await saveSubjects(newSubjects);

    if (isAuthenticated) {
      try {
        await api.deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task on server:', error);
      }
    }
  }, [subjects, isAuthenticated, saveSubjects]);

  const toggleTaskCompleted = useCallback(async (subjectId: string, taskId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    const task = subject?.tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  }, [subjects, updateTask]);

  const refreshSubjects = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const serverSubjects = await api.getSubjects();
      await saveSubjects(serverSubjects);
    } catch (error) {
      console.error('Error refreshing subjects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, saveSubjects]);

  const getSubject = useCallback((id: string) => {
    return subjects.find(s => s.id === id);
  }, [subjects]);

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        isLoading,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        refreshSubjects,
        getSubject,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectsProvider');
  }
  return context;
}
