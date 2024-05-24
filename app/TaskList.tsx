import { View, Text, } from 'react-native'
import React from 'react'
import TaskListing from '@/components/TaskListing'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function TaskList() {
  return (
    <SafeAreaView>
      <TaskListing/>
    </SafeAreaView>
  )
}