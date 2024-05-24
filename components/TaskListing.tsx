import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { TaskContext } from './TaskProvider'
import { router, useLocalSearchParams } from 'expo-router';
import { Task } from '@/constants/Task';
import ErrorPage from '@/app/ErrorPage';
import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import AsyncStorage from '@react-native-async-storage/async-storage';


const parseDateOnly = (dateString: string) => {
    // "YYYY-MM-DD HH:mm"のフォーマットから"YYYY-MM-DD"部分のみ切り取る
    return dayjs(dateString.split(' ')[0]).toDate();
};

export default function TaskListing() {
    const { selectedDate } = useLocalSearchParams();
    const { tasks, removeTask  } = useContext(TaskContext)!;
    const [tasksToDisplay, setTasksToDisplay] = useState<Task[]>([]);

    if (!selectedDate) {
        // selectedDateがnullの場合はエラーページを返す
        return <ErrorPage />
    }

    useEffect(() => {
        const tasksInRange = tasks.filter((task) => {
            const startDate = parseDateOnly(task.startdate || '');
            const endDate = parseDateOnly(task.enddate || '');
            const selectedDateObj = parseDateOnly(selectedDate.toString());
            return selectedDateObj >= startDate && selectedDateObj <= endDate;
        });
        setTasksToDisplay(tasksInRange);
    }, [selectedDate, tasks]);

    // const handlePressDelete = async (id: number, disp: number, startDate: string, endDate: string) => {
    //     await removeTask(id);
    // }
    
    const handlePressDelete = async (id: string, disp: number, startDate: string, endDate: string) => {
        await removeTask(id,disp,startDate,endDate);
    };
    
    
    
    
    

    const handlePressTask = (id: string) => {
        router.back();
        router.push({
            pathname: "EditTask",
            params: {id}
        })
    }

    return (
        <View>
            <Text style={styles.dateStyles}>{selectedDate}</Text>
            <FlatList
                data={tasksToDisplay}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={() => handlePressTask(item.id)} style={styles.taskDetails}>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 8,}}>
                            <Text>{item.title}</Text>
                            <Text>{item.context}</Text>
                            <View>
                            <Text>{item.startdate}</Text>
                            <Text>{item.enddate}</Text>
                            </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePressDelete(item.id, item.disp, item.startdate, item.enddate)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>削除</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    dateStyles: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 40,
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    taskDetails: {
        flex: 1,
    },
    deleteButton: {
        backgroundColor: "red",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
