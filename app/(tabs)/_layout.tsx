import { Tabs, Stack } from "expo-router";
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

export default function Layout() {
    return (
            <Tabs>
                <Tabs.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="AddTask"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => <MaterialIcons name="add-task" size={24} color="black" />,
                    }}
                />
                <Tabs.Screen
                    name="AllTasksListing"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => <Entypo name="list" size={24} color="black" />,
                    }}
                />
            </Tabs>
    );
}
