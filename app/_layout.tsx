import { Stack } from 'expo-router';
import { TaskProvider } from "@/components/TaskProvider";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
    return (
        <TaskProvider>
            <StatusBar style="light" />
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="TaskList"
                    options={{
                        headerShown: false,
                        presentation: "modal",
                    }}
                />
                <Stack.Screen
                    name="EditTask"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </TaskProvider>
    );
}
