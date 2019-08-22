import React from 'react';
import { View, ScrollView, Text, Dimensions, TouchableOpacity, StatusBar, FlatList, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Header } from 'react-navigation';
import moment  from 'moment';
import SQLite from 'react-native-sqlite-2';
import {deleteExpense} from './ExpenseActions';
const db = SQLite.openDatabase("expenses.db", '1.0', '', 1);
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class History extends React.Component {

    static navigationOptions = {
        headerTitle: 'History'
    }
    
    render() {
        return (
            <ScrollView>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    style = {{marginHorizontal: 5, marginTop: 3}}
                    data = {this.props.expenses.expenses.sort((a, b) => { return (Date.parse(b.date) - Date.parse(a.date))})}
                    renderItem = {({item, index}) => {
                        return(
                            <View style = {{marginBottom: 3}}>
                                <View style={{ borderColor: 'rgb(250, 220, 220)', paddingVertical: 6, borderWidth: 0.5, borderBottomWidth: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'rgba(180, 180, 250, 0.3)' }}>
                                    <Text style={{ color: "rgb(255, 70, 70)", fontSize: 20, fontFamily: 'sans-serif' }}>{this.props.date.date == 'm/d' ? moment(item.date).format('MM/DD/YYYY') : moment(item.date).format('DD/MM/YYYY')}</Text>
                                    <TouchableOpacity  style={{ position: 'absolute', right: 6, padding: 8 }}
                                        onPress={() => {
                                            db.transaction((tx) => {
                                                //    console.log('DELETE FROM QRS WHERE id = ' + item.id);
                                                tx.executeSql('DELETE FROM EXPENSE WHERE date = ' + Date.parse(item.date), [], (tx, res) => {
                                                    ToastAndroid.show("Deleted", ToastAndroid.SHORT);
                                                    this.props.deleteExpense(item);
                                                }, (err) => {console.log(err);});
                                            });
                                        }}
                                    >
                                        <Icon name="delete" size={22}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ borderColor: 'rgb(220, 220, 250)', borderWidth: 0.5, borderTopWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 10, paddingTop: 4, paddingBottom: 8, backgroundColor: 'rgba(250, 180, 180, 0.3)' }}>
                                    <Text style={{ fontSize: 15, color: 'black' }}>Type: {item.type}</Text> 
                                    <Text style={{ fontSize: 15, color: 'black' }}>Cost: {item.cost}</Text> 
                                    { item.description != '' ?
                                        <View style = {{marginTop: 4}}>
                                            <View  style = {{marginBottom: 4, height: 1, backgroundColor: 'rgba(0,0,0, 0.1)'}}/>
                                            <Text style={{ fontSize: 15, color: 'black' }}>{'\t'}{item.description}</Text>
                                        </View>
                                        :
                                        <View></View>
                                    }
                                </View>
                            </View>
                        )
                    }}
                
                />
            </ScrollView>
        )
    }
}


const mapStateToProps = (state) => {
    const { expenses, date } = state;
    return { expenses, date };
};


const mapDispatchToProps = dispatch => (
    bindActionCreators({
        deleteExpense,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(History);