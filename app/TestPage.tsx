import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TimePicker() {
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedTime: any) => {
    const currentTime = selectedTime || time;
    setShow(Platform.OS === 'ios'); // iOSでは常にshowをtrueに
    setTime(currentTime);
  };

  const showTimepicker = () => {
    if (show === false){
    setShow(true);
    } else if (show === true){
        setShow(false);
    } 
  };

  const formatTime = (date: any) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Button onPress={showTimepicker} title={formatTime(time)} />
      {show && (
        <View style={{borderTopWidth: 1, borderBottomWidth: 1, borderColor: "gray", marginTop: 10,}}>
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // iOSではスピナー表示
          onChange={onChange}
        />
        </View>
      )}
      <Text style={styles.selectedTime}>Selected Time: {formatTime(time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTime: {
    marginTop: 20,
    fontSize: 18,
  },
});