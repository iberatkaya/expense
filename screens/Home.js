import React from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Dimensions, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Header } from 'react-navigation';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import {
    BarChart,
    PieChart,
    ContributionGraph,
} from 'react-native-chart-kit'
import SQLite from 'react-native-sqlite-2';
import {colors, expenseTypes} from './consts';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {setExpense, setDate} from './ExpenseActions';
import SplashScreen from 'react-native-splash-screen';
import {AdMobBanner} from 'react-native-androide';
import {bannerid, demobannerid} from './appid';
const db = SQLite.openDatabase("expenses.db", '1.0', '', 1);

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height - Header.HEIGHT - StatusBar.currentHeight;

class Home extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            loadedAd: false,
            dateFormat: 'd/m'
        };
        this.loadFromDB = this.loadFromDB.bind(this);
        this.loadFromDB();
    }


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
                        SplashScreen.hide();
                    }, (tx, err) => { console.log(err); });
                }, (tx, err) => { console.log(err); }
            );
        })
    }

    BarChartData = (arr) => {
        if(arr == undefined)
            return [0,0,0,0,0,0,0];
        let initial = [0, 0, 0, 0, 0, 0, 0];
        for(let i=0; i<arr.length; i++){
            initial[arr[i].date.getDay()] += arr[i].cost; 
        }
        return initial;
    }

    PieChartData = (temp) => {
        if(temp == 0){
            return [];
        }
    //    let ex = { name: 'Seoul', population: 215, color: 'rgba(131, 167, 234, 1)', legendFontColor: '#7F7F7F', legendFontSize: 12 }
        let initial = [];
        for(let i in expenseTypes){
            initial.push({cost: 0, type: expenseTypes[i]});
        }
        for(let i=0; i<temp.length; i++){
            for(let j=0; j<initial.length; j++){
                if(temp[i].type == initial[j].type)
                    initial[j].cost += temp[i].cost;
            }
        }
        let entries = initial.sort((a, b) => {return ( - a.cost + b.cost);});
        const len = 7;
        let arr = [];
        for(let i=0; i<len; i++){
            let tempobj = { name: entries[i].type, cost: entries[i].cost, color: colors[entries[i].type], legendFontColor: '#7F7F7F', legendFontSize: 11 };
            arr.push(tempobj);
        }
        return arr;
    }

    ContGraphData = (entries) => {
        var arr = [];
        for(var i in entries){
            let add = true;
            var temp = {date: (moment(entries[i].date).format('YYYY-MM-DD')).toString(), count: entries[i].cost, number: 1};
            for(var j in arr){
                if(temp.date == moment(arr[j].date).format('YYYY-MM-DD').toString()){
                    arr[j].count += temp.count;
                    add = false;
                    arr[j].number++;
                }
            }
            if(add)
                arr.push(temp);
        }
        for(var k in arr){
            arr[k].count /= arr[k].number;
        }
        return arr;
    }

    static navigationOptions = ({navigation}) => ({
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

    render() {
        console.disableYellowBox = true;
        return (
            <View style={{ padding: 1, height: height }}>
                <ScrollView>
                    <View
                        style={{
                            alignSelf: 'center',
                            borderWidth: 0.5,
                            borderRadius: 24,
                            borderColor: 'rgb(200, 255, 200)',
                            backgroundColor: '#eeeeee',
                            marginTop: 12
                        }}>
                        <BarChart
                            data={{
                                labels: ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
                                datasets: [{
                                    data: this.BarChartData(this.props.expenses.expenses)
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
                        {this.props.expenses.expenses.length > 0 ?
                            <PieChart
                                data={this.PieChartData(this.props.expenses.expenses)}
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
                                style = {{ backgroundColor: 'rgba(0, 50, 0', paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center'}}
                                width={width * 0.96}
                                height={height * 0.38}
                            >
                                <Text style = {{fontFamily: 'sans-serif-light', fontSize: 23, textAlign: 'center', color: 'rgb(100, 150, 250)'}}>Enter an expense to view the pie chart</Text>
                            </View>
                        }
                    </View>
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
                                values={this.ContGraphData(this.props.expenses.expenses)}
                                endDate={new Date()}
                                numDays={80}
                                style = {{borderRadius: 24}}
                                width={width * 0.96}
                                accessor='count'
                                height={220}
                                chartConfig={{
                                    backgroundGradientFrom: '#fcfcfe',
                                    backgroundGradientTo: 'white',
                                    color: (opacity = 1) => `rgba(0, 0, 220, ${opacity})`,}}
                                />
                        </View>
                </ScrollView>
                {/* Floating Action Button */}
                <TouchableOpacity
                    style={{
                        elevation: 1,
                        position: 'absolute',
                        bottom: this.state.loadedAd ? 62 : 22,
                        right: 18,
                        borderWidth: 1,
                        borderColor: 'rgba(0,220,0,0.3)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        backgroundColor: '#fff',
                        borderRadius: 100,
                    }}
                    onPress={() => {
                        this.props.navigation.navigate('AddExp');
                    }}
                >
                    <Icon name="plus" size={30} color="rgb(60, 200, 60)" />
                </TouchableOpacity>
                <View style = {{position: 'absolute', bottom: 0, alignItems: 'center', width: width, backgroundColor: '#fff'}}>
                    <AdMobBanner
                        adSize="smartBanner"
                        adUnitID={bannerid}
                        onFailedToLoad={(m) => console.log(m)}
                        onLoad={(m) => {this.setState({loadedAd: true});}}
                        />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { expenses, date } = state;
    return { expenses, date };
};


const mapDispatchToProps = dispatch => (
    bindActionCreators({
      setExpense,
      setDate
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);