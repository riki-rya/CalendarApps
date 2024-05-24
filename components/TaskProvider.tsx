import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Task } from "@/constants/Task";

interface TaskProviderProps {
    children: React.ReactNode
}

export const TaskContext = React.createContext<{
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    fetchTaskData: () => Promise<void>
    addTask: (task: Task) => Promise<void>
    removeTask: (id: string, disp: number, startDate: string, endDate: string) => Promise<void>
    updateTask: (updatedTask: Task) => Promise<void>
    clearAllData: () => Promise<void>
} | undefined>(undefined);

export const TaskProvider = ({ children }: TaskProviderProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        fetchTaskData();
    }, []);

    const fetchTaskData = async () => {
      try {
          const tasksData = await AsyncStorage.getItem('tasks');
          if (tasksData !== null) {
              const tasks = JSON.parse(tasksData);
              setTasks(tasks);
              return tasks;
          }
          return []; // データがない場合は空の配列を返す
      } catch (error) {
          console.log("Error: fetchTaskData", error);
          return []; // エラーが発生した場合も空の配列を返す
      }
  };
  

    const addTask = async (task: Task) => {
        try {
          const updatedTasks = [...tasks, task];
          setTasks(updatedTasks);
          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        } catch (error) {
          console.log("Error: addTask", error)
        }
      };

      // const removeTask = async (taskId: number) => {
      //   try {
      //     const updatedTasks = tasks.filter(task => task.id !== taskId);
      //     setTasks(updatedTasks);
      //     await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      //   } catch (error) {
      //     console.log("Error: removeTask", error)
      //   }
      // };
      const removeTask = async (id: string, disp: number, startDate: string, endDate: string) => {
        try {
          // AsyncStorageから最新のtasksデータを読み込む
          // const tasksData = await AsyncStorage.getItem('tasks');
          // const tasks: Task[] = tasksData ? JSON.parse(tasksData) : [];
      
          // 削除するタスクを除外した新しいtasksデータを作成
          const updatedTasks: Task[] = tasks.filter((task: Task) => task.id !== id.toString());
      
          // updatedTasksをdispの値で並べ替える
          updatedTasks.sort((a, b) => a.disp - b.disp);
      
          // dispを再計算する
          for (let i = 0; i < updatedTasks.length; i++) {
            updatedTasks[i].disp = i;
          }
      
          // 更新後のtasksデータをAsyncStorageに保存する
          console.log(updatedTasks)
          setTasks(updatedTasks);
          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        } catch (error) {
          console.log("Error: removeTask", error);
          throw error;
        }
      };

      const updateTask = async (updatedTask: Task) => {
        try {
          const updatedTasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
          setTasks(updatedTasks);
          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        } catch (error) {
          console.log("Error: updateTask", error)
        }
      };

      const clearAllData = async () => {
        try {
          await AsyncStorage.clear();
          setTasks([]); // tasksの状態を空の配列に更新する
        } catch (error) {
          console.log('Error: clearAllData', error);
        }
      };

    return (
        <TaskContext.Provider value={{ tasks, setTasks, fetchTaskData, addTask, removeTask, updateTask, clearAllData }}>
            {children}
        </TaskContext.Provider>
    )
}