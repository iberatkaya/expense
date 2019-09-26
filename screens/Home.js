import React from 'react';
import { View, ScrollView, Picker, Animated, TouchableOpacity, StatusBar, Dimensions, Text, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Header } from 'react-navigation-stack';
import moment from 'moment';
import Select from 'react-native-picker-select';
import AsyncStorage from '@react-native-community/async-storage';
import {
    BarChart,
    PieChart,
    ContributionGraph,
} from 'react-native-chart-kit'
import MonthSelectorCalendar from 'react-native-month-selector';
import SQLite from 'react-native-sqlite-2';
import { colors, expenseTypes, months } from './consts';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setExpense, setDate, setTotalMonth } from './ExpenseActions';
import SplashScreen from 'react-native-splash-screen';
import { AdMobBanner, AdMobInterstitial } from 'react-native-androide';
import { bannerid, demobannerid, demointerstitial, interstitialid } from './appid';
const db = SQLite.openDatabase("expenses.db", '1.0', '', 1);

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height - Header.HEIGHT - StatusBar.currentHeight;
var adctr = 0;

class Home extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            loadedAd: false,
            dateFormat: 'd/m',
            monthsandyears: [{ value: { month: new Date().getMonth(), year: new Date().getFullYear(), date: new Date() }, label: months[new Date().getMonth()].long, key: '0' }],
            selectedmonth: moment(new Date()),
            viewMonthSelect: false,
            fadeAnim: new Animated.Value(0),
            totalMonthSpending: 0
        };
        this.loadFromDB = this.loadFromDB.bind(this);
        this.loadFromDB();
        const isHermes = () => global.HermesInternal != null;
        console.log(isHermes());
    }

    /*
        getMonthsAndYear = (data) => {
            var sorteddata = data.sort((a, b) => { return (Date.parse(b.date) - Date.parse(a.date))});
            var monthsandyearsindex = sorteddata.map((a) => {
                return {value: {month: a.date.getMonth(), year: a.date.getFullYear()}, label: months[a.date.getMonth()].long};
            })
        
            var filtered = temp.filter((i) => { 
                if(i.date.getMonth() == time.getMonth() && i.date.getFullYear() == time.getFullYear())
                    return i;
            });
            var a = monthsandyearsindex; //not unique
            console.log(a);
            return a;
        }*/


    loadFromDB() {
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS EXPENSE (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, type TEXT, cost TEXT, date INTEGER);', [],
                (tx, res) => {
                    tx.executeSql('SELECT * FROM EXPENSE', [], async (tx, res) => {
                        let len = res.rows.length;
                        let arr = [];
                        for (let i = 0; i < len; i++) {
                            let tempobj = {
                                date: new Date(res.rows.item(i).date),
                                cost: parseFloat(parseFloat(res.rows.item(i).cost).toFixed(2)),
                                description: res.rows.item(i).description,
                                type: res.rows.item(i).type
                            };
                            arr.push(tempobj);
                        }
                        this.props.setExpense(arr);
                        var dateFormat = await AsyncStorage.getItem('@dateFormat');
                        this.props.setDate(dateFormat);
                        var funcmonths = arr;
                        let k = 0;
                        for (let a in funcmonths) {
                            funcmonths[a].key = k.toString();
                            k++;
                        }
                        if (funcmonths.length > 0)
                            this.setState({ monthsandyears: funcmonths });
                        SplashScreen.hide();
                    }, (tx, err) => { console.log(err); });
                }, (tx, err) => { console.log(err); }
            );
        })
    }

    totalMonthSpending = (arr, time) => {
        if (arr == undefined)
            return 0;
        let initial = 0;
        var filtered = arr.filter((i) => {
            if (i.date.getMonth() == time.getMonth() && i.date.getFullYear() == time.getFullYear())
                return i;
        });
        for (let i = 0; i < filtered.length; i++) {
            initial += filtered[i].cost;
        }
        return initial.toString();
    }


    BarChartData = (arr, time) => {
        if (arr == undefined)
            return [0, 0, 0, 0, 0, 0, 0];
        let initial = [0, 0, 0, 0, 0, 0, 0];
        var filtered = arr.filter((i) => {
            if (i.date.getMonth() == time.getMonth() && i.date.getFullYear() == time.getFullYear())
                return i;
        });
        for (let i = 0; i < filtered.length; i++) {
            initial[filtered[i].date.getDay()] += filtered[i].cost;
        }
        return initial;
    }


    PieChartData = (temp, time) => {
        if (temp.length == 0) {
            return [];
        }
        //    let ex = { name: 'Seoul', population: 215, color: 'rgba(131, 167, 234, 1)', legendFontColor: '#7F7F7F', legendFontSize: 12 }
        let initial = [];
        for (let i in expenseTypes) {
            initial.push({ cost: 0, type: expenseTypes[i] });
        }
        var filtered = temp.filter((i) => {
            if (i.date.getMonth() == time.getMonth() && i.date.getFullYear() == time.getFullYear())
                return i;
        });
        if(filtered.length == 0)
            return [];
        for (let i = 0; i < filtered.length; i++) {
            for (let j = 0; j < initial.length; j++) {
                if (filtered[i].type == initial[j].type)
                    initial[j].cost += filtered[i].cost;
            }
        }
        let entries = initial.sort((a, b) => { return (- a.cost + b.cost); });
        const len = 7;
        let arr = [];
        for (let i = 0; i < len; i++) {
            let tempobj = { name: entries[i].type, cost: entries[i].cost, color: colors[entries[i].type], legendFontColor: '#7F7F7F', legendFontSize: 11 };
            arr.push(tempobj);
        }
        return arr;
    }

    ContGraphData = (entries, time) => {
        var arr = [];
        var filtered = entries.filter((i) => {
            if (i.date.getMonth() == time.getMonth() && i.date.getFullYear() == time.getFullYear())
                return i;
        });
        for (var i in filtered) {
            var temp = { date: (moment(filtered[i].date).format('YYYY-MM-DD')).toString(), count: filtered[i].cost};
            arr.push(temp);
        }
        return arr;
    }

    static navigationOptions = ({ navigation }) => ({
        headerTitle: 'Expense Tracker',
        headerLeft: (
            <TouchableOpacity
                onPress={() => navigation.openDrawer()}
            >
                <View style={{ marginLeft: 12, padding: 4 }}>
                    <Icon name="menu" size={28} color='white' />
                </View>
            </TouchableOpacity>
        )
    })

    async componentDidMount() {
        await AdMobInterstitial.setAdUnitID(interstitialid);
        await AdMobInterstitial.requestAd();
    }


    load = () => {
        let arr = [];
        for(let a=0, len = this.state.monthsandyears.length; a<len; a++){
            let add = true;
            for(let b=0, len2 = arr.length; b<len2; b++){
                if(arr[b].month == this.state.monthsandyears[a].value.month && arr[b].year == this.state.monthsandyears[a].value.year)
                    add = false;
            }
            if(add)
                arr.push(this.state.monthsandyears[a]);
        }
        var i = 0;
        return this.state.monthsandyears.map(item => {
            return (<Picker.Item label={months[item.value.month].long + '/' + item.value.year} value={item} color="black" key={i++} />);
        }
        );
    }


    render() {
        console.disableYellowBox = true;
        return (
            <SafeAreaView style={{ padding: 1 }}>
                <ScrollView contentContainerStyle = {{ paddingBottom: '20%'}}>
                    <View style = {{alignItems: 'center', marginTop: 5}}>
                        <TouchableOpacity
                            style = {{justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f8', borderRadius: 20}}
                            onPress = {() => {
                                let mybool = this.state.viewMonthSelect;
                                if(!mybool)
                                    Animated.timing(this.state.fadeAnim, {toValue: 1, duration: 200}).start(() => {
                                        this.setState({viewMonthSelect: !mybool});
                                    })
                                else
                                    Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 150}).start(() => {
                                        this.setState({viewMonthSelect: !mybool})
                                    });
                            
                            }}
                        >
                            <Text style = {{textAlign: 'center', fontSize: 16, color: '#555'}}>Selected Month: {this.state.selectedmonth.format('MMM YYYY')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Animated.View
                        style = {{opacity: this.state.fadeAnim, position: 'absolute', zIndex: 1, width: '100%', marginTop: '14%'}}
                    >
                        <MonthSelectorCalendar
                            selectedDate = {moment(this.state.selectedmonth)}
                            minimumDate = {moment(new Date(2000, 0, 1))}
                            containerStyle = {{backgroundColor: 'rgba(220, 220, 225, 0.4)'}}
                            swipable = {true}
                            onMonthTapped={(date) => {
                                Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 150}).start(() => {
                                    this.setState({ selectedmonth: date, viewMonthSelect: false})
                                });
                            }}
                        />
                    </Animated.View>
                    <View style = {{marginTop: 5, alignSelf: 'center', backgroundColor: '#f0f0f8', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20}}>
                        <Text style = {{color: '#444', fontSize: 15}}>{this.state.selectedmonth.format('MMM')}. Total Spending: {this.totalMonthSpending(this.props.expenses.expenses, moment(this.state.selectedmonth).toDate())}</Text>
                    </View>
                    <View
                        style={{
                            alignSelf: 'center',
                            borderWidth: 0.5,
                            borderRadius: 24,
                            borderColor: 'rgb(200, 255, 200)',
                            backgroundColor: '#eeeeee',
                            marginTop: 6
                        }}>
                        <BarChart
                            data={{
                                labels: ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
                                datasets: [{
                                    data: this.BarChartData(this.props.expenses.expenses, moment(this.state.selectedmonth).toDate())
                                }]
                            }}
                            style={{ borderRadius: 24 }}
                            width={width * 0.96}
                            height={height * 0.4}
                            chartConfig={{
                                backgroundGradientFrom: 'white',
                                backgroundGradientTo: '#f9f9f9',
                                color: (opacity = 1) => `rgba(0, 0, 90, ${opacity})`,
                            }}
                        />
                    </View>
                    <View
                        style={{
                            alignSelf: 'center',
                            borderWidth: 0.5,
                            borderRadius: 24,
                            borderColor: 'rgb(200, 255, 200)',
                            backgroundColor: '#f3fff3',
                            marginTop: 12
                        }}>
                        {this.PieChartData(this.props.expenses.expenses, moment(this.state.selectedmonth).toDate()).length > 0 ?
                            <PieChart
                                data={this.PieChartData(this.props.expenses.expenses, moment(this.state.selectedmonth).toDate())}
                                width={width * 0.96}
                                height={height * 0.38}
                                chartConfig={{
                                    backgroundGradientFrom: 'white',
                                    backgroundGradientTo: '#f9f9f9',
                                    color: (opacity = 1) => `rgba(0, 50, 0, ${opacity})`,
                                }}
                                accessor="cost"
                                backgroundColor="transparent"
                                paddingLeft="8"
                                absolute
                            />
                            :
                            <View
                                style={{ backgroundColor: 'rgba(0, 50, 0', paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }}
                                width={width * 0.96}
                                height={height * 0.38}
                            >
                                <Text style={{ fontFamily: 'sans-serif-light', fontSize: 23, textAlign: 'center', color: 'rgb(100, 150, 250)' }}>Enter an expense to view the pie chart</Text>
                            </View>
                        }
                    </View>
                </ScrollView>
                {/* Floating Action Button */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: this.state.loadedAd ? '13%' : 22,
                        right: 18,
                        borderWidth: 1,
                        borderColor: 'rgb(0,220,0)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        backgroundColor: 'white',
                        borderRadius: 120,
                    }}
                    onPress={() => {
                        adctr++;
                        if (adctr == 4 || adctr == 10)
                            AdMobInterstitial.showAd();
                        this.props.navigation.navigate('AddExp');
                    }}
                >
                    <Icon name="plus" size={30} color="rgb(60, 200, 60)" />
                </TouchableOpacity>
                <View style={{ position: 'absolute', bottom: 0, alignItems: 'center', width: width, backgroundColor: '#fff' }}>
                    <AdMobBanner
                        adSize="smartBanner"
                        adUnitID={bannerid}
                        onFailedToLoad={(m) => console.log(m)}
                        onLoad={(m) => { this.setState({ loadedAd: true }); }}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    const { expenses, date, total_month } = state;
    return { expenses, date, total_month };
};


const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setExpense,
        setDate,
        setTotalMonth
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);


/*
        var filtered = temp.filter((i) => {
            if(i.date.getMonth() == time.getMonth() && i.date.getFullYear() == time.getFullYear())
                return i;
        });
        
        
                    <View
                        style={{
                            alignSelf: 'center',
                            borderWidth: 0.5,
                            borderRadius: 24,
                            borderColor: 'rgb(200, 255, 200)',
                            backgroundColor: '#f3fff3',
                            marginTop: 12,
                            marginBottom: this.state.loadedAd ? 70 : 20
                        }}>
                        <ContributionGraph
                            values={this.ContGraphData(this.props.expenses.expenses, moment(this.state.selectedmonth).toDate())}
                            endDate={moment(this.state.selectedmonth).endOf('month').toDate()}
                            numDays={80}
                            style={{ borderRadius: 24 }}
                            width={width * 0.96}
                            accessor='count'
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: '#fcfcfe',
                                backgroundGradientTo: 'white',
                                color: (opacity = 1) => `rgba(0, 0, 220, ${opacity})`,
                            }}
                        />
                    </View>
        
        */