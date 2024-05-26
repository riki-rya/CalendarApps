import { View, Text, SafeAreaView, TextInput, StyleSheet, TouchableOpacity, Modal, Platform, Button } from 'react-native'
import React, { useContext, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { TaskContext } from '@/components/TaskProvider';
import { CalendarList } from 'react-native-calendars';
import RNPickerSelect from 'react-native-picker-select';
import { Task } from '@/constants/Task';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

export default function EditTask() {
  const { id } = useLocalSearchParams();
  const { tasks, updateTask } = useContext(TaskContext)!;
  const thisTask = tasks.find((task) => task.id.toString() === id);

  const [newTitle, setNewTitle] = useState(thisTask?.title);
  const [newContext, setNewContext] = useState(thisTask?.context);
  const [newStartdate, setNewStartdate] = useState(thisTask?.startdate ? thisTask.startdate.split(' ')[0] : '');
  const [newEnddate, setNewEnddate] = useState(thisTask?.enddate ? thisTask.enddate.split(' ')[0] : '');
  const [newColor, setNewColor] = useState(thisTask?.color);

  const [startTime, setStartTime] = useState(thisTask?.startdate ? new Date(`1970-01-01T${thisTask.startdate.split(' ')[1]}`) : new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [endTime, setEndTime] = useState(thisTask?.enddate ? new Date(`1970-01-01T${thisTask.enddate.split(' ')[1]}`) : new Date());
  const [showEndTime, setShowEndTime] = useState(false);
  const [startdateModalVisible, setStartdateModalVisible] = useState(false);
  const [enddateModalVisible, setEnddateModalVisible] = useState(false);

  const parseDateOnly = (dateString: string) => {
    // "YYYY-MM-DD HH:mm"のフォーマットから"YYYY-MM-DD"部分のみ切り取る
    return dayjs(dateString.split(' ')[0]).toDate();
  };

  const onChangeStartTime = (event: any, selectedTime: any) => {
    const currentStartTime = selectedTime || startTime;
    setShowStartTime(Platform.OS === 'ios'); // iOSでは常にshowをtrueに
    setStartTime(currentStartTime);
  };

  const onChangeEndTime = (event: any, selectedTime: any) => {
    const currentEndTime = selectedTime || endTime;
    setShowEndTime(Platform.OS === 'ios'); // iOSでは常にshowをtrueに
    setEndTime(currentEndTime);
  };

  const showStartTimepicker = () => {
    if (showStartTime === false) {
      setShowStartTime(true);
    } else if (showStartTime === true) {
      setShowStartTime(false);
    }
  };


  const showEndTimepicker = () => {
    if (showEndTime === false) {
      setShowEndTime(true);
    } else if (showEndTime === true) {
      setShowEndTime(false);
    }
  };

  const formatTime = (date: any) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleUpdateTasks = async () => {
    if (!thisTask) return; // null チェック

    let missingFields = [];

    if (!newTitle) {
      missingFields.push("タイトル");
    }
    if (!newContext) {
      missingFields.push("コンテキスト");
    }
    if (!newStartdate) {
      missingFields.push("開始日");
    }
    if (!newEnddate) {
      missingFields.push("終了日");
    }
    if (!newColor) {
      missingFields.push("色");
    }

    const startDateTime = new Date(`${newStartdate}T${formatTime(startTime)}`);
    const endDateTime = new Date(`${newEnddate}T${formatTime(endTime)}`);

    if (newStartdate && newEnddate && startDateTime > endDateTime) {
      missingFields.push("日付の選択が無効です");
    }


    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.map((field) => `・${field}`).join("\n");
      alert(`次の項目が入力されていません:\n\n${missingFieldsMessage}`);
      return;
    }

    const updatedTask: Task = {
      ...thisTask,
      title: newTitle || '', // nullish coalescing演算子を使用してnullまたはundefinedの場合に空文字列を代入
      context: newContext || '',
      startdate: `${newStartdate} ${formatTime(startTime)}`,
      enddate: `${newEnddate} ${formatTime(endTime)}`,
      color: newColor || '',
      disp: 0,
    };


    // 既存のタスクと日程が重複するかどうかを確認
    const overlappingTasks = tasks.filter((task) => {
      if (thisTask && task.id === thisTask.id) {
        return false;
      }
      const newStartDate = new Date(newStartdate);
      const newEndDate = new Date(newEnddate);
      const taskStartDate = new Date(task.startdate.split(' ')[0]);
      const taskEndDate = new Date(task.enddate.split(' ')[0]);
    
      return ((taskStartDate <= newEndDate && taskEndDate >= newStartDate));
    });
    console.log(overlappingTasks)
    
    if (overlappingTasks.length > 0) {
      const sortedDispValues = overlappingTasks
        .map((task, index) => ({ disp: task.disp, id: task.id, index }))
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
  
      updatedTask.disp = missingValues.length > 0 ? missingValues.shift()! : nextDisp;
    } else {
      updatedTask.disp = 0;
    }
    
    await updateTask(updatedTask); // 更新されたタスクを更新する
    router.back();
    
  }



  return (
    <SafeAreaView style={styles.screens}>
      <View style={styles.container}>
        {/* <View style={{ borderColor: "gray", borderWidth: 2, width: "100%", padding: 40, borderRadius: 6, }}> */}
        <TextInput
          style={styles.Inputstyles}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder='タイトル'
          placeholderTextColor={"gray"}
        />
        <TextInput
          style={styles.Inputstyles}
          value={newContext}
          onChangeText={setNewContext}
          placeholder='内容'
          placeholderTextColor={"gray"}
        />

        <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "100%", justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
          </View>
        </View>
        <View style={{ width: "100%" }}>
          <View style={{ flexDirection: "column", alignContent: "center" }}>
            <View style={{ borderColor: "gray", marginTop: 10, }}>
              <View style={styles.SelectDateContainer}>
                <TouchableOpacity style={styles.SelectDateButton} onPress={() => setStartdateModalVisible(true)}>
                  <Text style={{ textAlign: "center" }}>{newStartdate || "Start Date"}</Text>
                </TouchableOpacity>
                <Button onPress={showStartTimepicker} title={formatTime(startTime)} />
              </View>
              {showStartTime && (
                <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: "gray", marginTop: 10, }}>
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} // iOSではスピナー表示
                    onChange={onChangeStartTime}
                    textColor="black"
                  />
                </View>
              )}
              <Modal style={styles.modalStyles} presentationStyle="formSheet" visible={startdateModalVisible} animationType="slide" onRequestClose={() => setStartdateModalVisible(false)}>
                <Text>StartDate</Text>
                <CalendarList hideArrows={false} horizontal={true} pagingEnabled={true} onDayPress={(day) => { setNewStartdate(day.dateString); setStartdateModalVisible(false); }} />
              </Modal>
            </View>
            <View style={{ flexDirection: "column", alignContent: "center" }}>
              <View style={styles.SelectDateContainer}>
                <TouchableOpacity style={styles.SelectDateButton} onPress={() => setEnddateModalVisible(true)}>
                  <Text style={{ textAlign: "center" }}>{newEnddate || "End Date"}</Text>
                </TouchableOpacity>
                <Button onPress={showEndTimepicker} title={formatTime(endTime)} />
              </View>
              {showEndTime && (
                <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: "gray", marginTop: 10, }}>
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} // iOSではスピナー表示
                    onChange={onChangeEndTime}
                    textColor="black"
                  />
                </View>
              )}
              <Modal style={styles.modalStyles} presentationStyle="formSheet" visible={enddateModalVisible} animationType="slide" onRequestClose={() => setEnddateModalVisible(false)}>
                <Text>EndDate</Text>
                <CalendarList hideArrows={false} horizontal={true} pagingEnabled={true} onDayPress={(day) => { setNewEnddate(day.dateString); setEnddateModalVisible(false); }} />
              </Modal>
            </View>
          </View>
        </View>
        <View style={styles.Pickerstyles}>
          <RNPickerSelect
            onValueChange={(value) => setNewColor(value)}
            items={[
              { label: 'デフォルト', value: '#4169e1' },
              { label: '自宅', value: '#7fffd4' },
              { label: '職場', value: '#ee82ee' },
            ]}
            style={pickerSelectStyles}
            value={newColor}
            placeholder={{ label: '選択してください', value: '' }}
          />
        </View>
        <TouchableOpacity
          style={styles.saveBoxStyles}
          onPress={handleUpdateTasks}
        ><Text style={{ textAlign: "center", fontWeight: "bold" }}>保存</Text></TouchableOpacity>
      </View>
      {/* </View> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screens: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  container: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  Inputstyles: {
    width: "100%",
    borderWidth: 2,
    borderColor: '#ccceee',
    marginBottom: 10,
    borderRadius: 6,
    padding: 8,
    textAlign: "center",
  },
  SelectDateContainer: {
    marginTop: 10,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  SelectDateText: {
    width: "30%",
    marginBottom: 5,
    fontSize: 16,
    textAlign: "center",
  },
  SelectDateButton: {
    width: "70%",
    borderWidth: 2,
    borderColor: '#ccceee',
    borderRadius: 6,
    padding: 8,
    backgroundColor: "white",
    textAlign: "center",
  },
  modalStyles: {
    borderRadius: 10,
    backgroundColor: "gray",
  },
  Pickerstyles: {
    width: "100%",
    marginBottom: 5,
    textAlign: "center",
    borderRadius: 6,
    padding: 8,
  },
  saveBoxStyles: {
    width: "100%",
    marginBottom: 5,
    textAlign: "center",
    borderRadius: 6,
    padding: 8,
    borderWidth: 2,
    borderColor: '#ccceee',
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#789',
    borderRadius: 4,
    color: '#789',
    paddingRight: 30, // to ensure the text is never behind the icon
    width: "100%",
    // marginLeft: 30
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#789',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    width: "100%",
    // marginLeft: 30,
    backgroundColor: '#eee'
  },
});