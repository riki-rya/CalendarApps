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
  // const removeTask = async (id: string, disp: number, startDate: string, endDate: string) => {
  //   try {
  //     // 指定されたstartDateからendDateまでの期間に関係するtasksを取得
  //     const relatedTasks = tasks.filter((task: Task) => {
  //       const taskStartDate = new Date(task.startdate.split(' ')[0]);
  //       const taskEndDate = new Date(task.enddate.split(' ')[0]);
  //       const start = new Date(startDate.split(' ')[0]);
  //       const end = new Date(endDate.split(' ')[0]);
  //       return (taskStartDate <= end && taskEndDate >= start);
  //     });

  //     // 削除するタスクを除外した新しいtasksデータを作成
  //     const updatedTasks = tasks.filter((task: Task) => task.id !== id.toString());

  //     // 関連するtasksの中でdispより大きい数値を持つtasksを取得し、dispを-1する
  //     for (let task of relatedTasks) {
  //       if (task.disp > disp) {
  //         task.disp -= 1;
  //       }
  //     }

  //     // updatedTasksをdispの値で並べ替える
  //     updatedTasks.sort((a, b) => a.disp - b.disp);

  //     // 更新後のtasksデータをAsyncStorageに保存する
  //     console.log(updatedTasks)
  //     setTasks(updatedTasks);
  //     await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  //   } catch (error) {
  //     console.log("Error: removeTask", error);
  //     throw error;
  //   }
  // };

  const removeTask = async (id: string, disp: number, startDate: string, endDate: string) => {
    try {
      // 削除するタスクを除外した新しいtasksデータを作成
      const updatedTasks: Task[] = tasks.filter((task: Task) => task.id !== id.toString());
  
      // 削除したタスクを取得
      const deletedTask = tasks.find((task: Task) => task.id === id.toString());
  
      // 指定されたstartDateからendDateまでの期間に関係するtasksを取得
      const relatedTasks = updatedTasks.filter((task: Task) => {
        const taskStartDate = new Date(task.startdate.split(' ')[0]);
        const taskEndDate = new Date(task.enddate.split(' ')[0]);
        const start = new Date(startDate.split(' ')[0]);
        const end = new Date(endDate.split(' ')[0]);
        return (taskStartDate <= end && taskEndDate >= start);
      });
  
      relatedTasks.forEach((task) => {
        updateDispForRelatedTasks(updatedTasks, deletedTask!, relatedTasks, task);
      });
  
      const finalUpdatedTasks = [...relatedTasks, ...updatedTasks.filter((task) => !relatedTasks.includes(task))];
  
      setTasks(finalUpdatedTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(finalUpdatedTasks));
    } catch (error) {
      console.log("Error: removeTask", error);
      throw error;
    }
  };
  
  const updateDispForRelatedTasks = (updatedTasks: Task[], deletedTask: Task, relatedTasks: Task[], task: Task) => {
    const overlappingTasks = updatedTasks.filter((t) => {
      const taskStartDate = new Date(t.startdate.split(' ')[0]);
      const taskEndDate = new Date(t.enddate.split(' ')[0]);
  
      return relatedTasks.some((relatedTask) => {
        const relatedTaskStartDate = new Date(relatedTask.startdate.split(' ')[0]);
        const relatedTaskEndDate = new Date(relatedTask.enddate.split(' ')[0]);
  
        return (
          (t.id !== task.id) && // 自身を除外するための条件
          ((taskStartDate >= relatedTaskStartDate && taskStartDate <= relatedTaskEndDate) || // タスクの開始日がrelatedTaskの開始日と終了日の間にある
           (taskEndDate >= relatedTaskStartDate && taskEndDate <= relatedTaskEndDate) || // タスクの終了日がrelatedTaskの開始日と終了日の間にある
           (taskStartDate <= relatedTaskStartDate && taskEndDate >= relatedTaskEndDate)) // タスクの期間がrelatedTaskの期間を完全に含む
        );
      });
    });
  
    console.log(overlappingTasks);
  
    if (overlappingTasks.length > 0) {
      const sortedDispValues = overlappingTasks
        .map((t) => ({ disp: t.disp, id: t.id }))
        .sort((a, b) => {
          if (a.disp === b.disp) {
            // dispが同じ場合はidでソート
            return a.id.localeCompare(b.id);
          } else {
            // dispが異なる場合はdispでソート
            return a.disp - b.disp;
          }
        })
        .map(({ disp }) => disp);
  
      const uniqueDispValues = sortedDispValues.filter((value, index, self) => self.indexOf(value) === index);
  
      let nextDisp = 0;
      const missingValues = [];
  
      for (let i = 0; i < uniqueDispValues.length; i++) {
        if (uniqueDispValues[i] !== i) {
          nextDisp = i;
          missingValues.push(...Array.from({ length: uniqueDispValues[i] - i }, (_, j) => i + j));
          break;
        }
      }
  
      // 上記のループでnextDispが更新されなかった場合は、連続した値になっている
      // その場合は、uniqueDispValuesの最後の値に1を加えた値がnextDispとなる
      if (nextDisp === 0) {
        nextDisp = uniqueDispValues[uniqueDispValues.length - 1] + 1;
      }
  
      task.disp = missingValues.length > 0 ? missingValues.shift()! : nextDisp;
    } else {
      task.disp = 0;
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