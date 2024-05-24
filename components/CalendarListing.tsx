import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { CalendarList, DateData, LocaleConfig } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { TaskContext } from './TaskProvider';
import { Task } from '@/constants/Task';
import { router } from 'expo-router';
import { dateFormat } from '@/constants/dateFormat';
import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';

type Props = DayProps & {
    date?: DateData | undefined;
};

LocaleConfig.locales.jp = {
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

const parseDateOnly = (dateString: string) => {
    // "YYYY-MM-DD HH:mm"のフォーマットから"YYYY-MM-DD"部分のみ切り取る
    return dayjs(dateString.split(' ')[0]).toDate();
};


export const DayItems: React.FC<Props> = ({ date }) => {
    const { tasks } = useContext(TaskContext)!;
    const [dayTasks, setDayTasks] = React.useState<Task[]>([]);

    useEffect(() => {
        const currentDayTasks = tasks.filter((task) => {
            const startDate = parseDateOnly(task.startdate || '');
            const endDate = parseDateOnly(task.enddate || '');
            const currentDate = parseDateOnly(date?.dateString || '');

            return currentDate >= startDate && currentDate <= endDate;
        });

        setDayTasks(currentDayTasks);
    }, [tasks]);

    const handlePressDay = () => {
        const selectedDate = date?.dateString;
        router.push({
            pathname: "TaskList",
            params: { selectedDate }
        });
    };

    const renderEvent = (task: Task, index: number, currentDate: String) => {
        // dispの値が4以上の場合は何も返さない
        if (task.disp >= 4) {
            return null;
        }
    
        const isStartDate = currentDate === task.startdate.split(' ')[0];
        const borderLeft = isStartDate ? 5 : 0;
        const borderRight = currentDate === task.enddate.split(' ')[0] ? 5 : 0;
        
    
        return (
            <View
                key={`${task.disp}-${index}`}
                style={[
                    styles.event,
                    {
                        backgroundColor: task.color,
                        borderTopLeftRadius: borderLeft,
                        borderBottomLeftRadius: borderLeft,
                        borderTopRightRadius: borderRight,
                        borderBottomRightRadius: borderRight,
                    },
                ]}
            >
                {isStartDate ? (
                    <Text style={styles.eventText} numberOfLines={4}>
                        {task.title}
                    </Text>
                ) : null}
            </View>
        );
    };

    const renderLane = (laneNumber: number, date: DateData) => {
        const currentDate: string = date.dateString;
        return(
        <View key={laneNumber} style={styles.lane}>
            {dayTasks
                .filter(task => task.disp === laneNumber)
                .map((task, index) => renderEvent(task, index, currentDate))}
        </View>)
    };

    return (
        <View style={styles.cell}>
            <TouchableOpacity onPress={handlePressDay}>
                <Text style={styles.dayStyles}>{date?.day}</Text>
                <View style={styles.laneContainer}>
                    {date && [0, 1, 2, 3].map(laneNumber => renderLane(laneNumber, date))}
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default function Calendars() {
    return (
        <View>
            <CalendarList
                horizontal={true}
                hideArrows={false}
                firstDay={0}
                pagingEnabled={true}
                dayComponent={(props) => <DayItems {...props} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    cell: {
        width: '100%',
    },
    dayStyles: {
        textAlign: "center"
    },
    laneContainer: {
        width: "100%",
        flexDirection: 'column',
    },
    lane: {
        width: "100%",
        flexDirection: 'row',
        height: 16,
        // marginBottom: 3,
    },
    event: {
        flex: 1,
        marginHorizontal: 0,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    eventText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
});
