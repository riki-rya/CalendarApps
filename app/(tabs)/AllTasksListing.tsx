import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { TaskContext } from '@/components/TaskProvider';
import { router, } from 'expo-router';

export default function AllTasksListing() {
    const { tasks, removeTask, clearAllData } = useContext(TaskContext)!;

    const handlePressDelete = async (id: string, disp: number, startDate: string, endDate: string) => {
        await removeTask(id,disp,startDate,endDate);
    }

    const handlePressTask = (id: string) => {
        router.push({
            pathname: "EditTask",
            params: {id}
        })
    }

    return (
        <SafeAreaView>
            <Text style={styles.dateStyles}>AllTaskListing</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={() => handlePressTask(item.id)} style={styles.taskDetails}>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 8,}}>
                            <Text>{item.id}</Text>
                            <Text>{item.title}</Text>
                            <Text>{item.context}</Text>
                            <Text>{item.disp}</Text>
                            <View>
                            <Text>{item.startdate}</Text>
                            <Text>{item.enddate}</Text>
                            </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePressDelete(item.id,item.disp,item.startdate,item.enddate)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>削除</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Button title="ALL DELETE" onPress={clearAllData}/>
        </SafeAreaView>
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
