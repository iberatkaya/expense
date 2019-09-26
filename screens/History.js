import React from 'react';
import { View, ScrollView, SectionList, Text, Dimensions, TouchableOpacity, StatusBar, FlatList, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import SQLite from 'react-native-sqlite-2';
import { deleteExpense } from './ExpenseActions';
const db = SQLite.openDatabase("expenses.db", '1.0', '', 1);
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {months} from './consts';

const width = Dimensions.get('window').width;

class History extends React.Component {

    static navigationOptions = {
        headerTitle: 'History'
    }

    constructor(props) {
        super(props);
        this.state = {
            expenses: this.props.expenses.expenses.map((i) => {
                return { data: [i], title: months[i.date.getMonth()].long + ' ' + i.date.getFullYear().toString() }
            })
        };
    }
    
    sectionListData = (arr) => {
        var newarr = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var add = true;
            for (var j = 0, len2 = newarr.length; j < len2; j++) {
                if (newarr[j].title == arr[i].title) {
                    add = false;
                    newarr[j].data.push(arr[i].data[0]);
                }
            }
            if (add)
                newarr.push(arr[i]);
        }
        return newarr;
    }

    render() {
        return (
            <ScrollView>
                {this.state.expenses.length == 0 ? 
                    <Text style = {{textAlign: 'center', marginTop: 24, fontSize: 16, color: '#999'}}>You do not have any entries yet!</Text>
                    :
                    <View/>
                }
                <SectionList
                    keyExtractor={(item, index) => index.toString()}
                    style={{ marginHorizontal: 5, marginTop: 3 }}
                    renderItem={
                        ({ item, index, section }) => {
                            let style = index == section.data.length-1 ? {marginBottom: 4, paddingBottom: 4, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingBottom: 6, backgroundColor: 'rgba(250, 180, 180, 0.3)' } : { backgroundColor: 'rgba(250, 180, 180, 0.3)'};
                            return (
                                <View style={style}>
                                    <View style={{ marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: width * 0.04 }}>
                                        <Text style={{ fontSize: 15, color: 'black',textAlign: 'center' }}>Date: {this.props.date.date == 'm/d' ? moment(item.date).format('MM/DD/YYYY') : moment(item.date).format('DD/MM/YYYY')}</Text>
                                        <TouchableOpacity style={{}}
                                                onPress={() => {
                                                    db.transaction((tx) => {
                                                        //    console.log('DELETE FROM QRS WHERE id = ' + item.id);
                                                        tx.executeSql('DELETE FROM EXPENSE WHERE date = ' + Date.parse(item.date), [], (tx, res) => {
                                                            ToastAndroid.show("Deleted", ToastAndroid.SHORT);
                                                            this.props.deleteExpense(item);
                                                            this.setState({expenses: this.props.expenses.expenses.map((i) => {
                                                                return { data: [i], title: months[i.date.getMonth()].long + ' ' + i.date.getFullYear().toString() }
                                                            })});
                                                        }, (err) => { console.log(err); });
                                                    });
                                                }}
                                            >
                                            <Icon name="delete" size={20} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: width * 0.04 }}>
                                        <Text style={{ fontSize: 15, color: 'black' }}>Type: {item.type}</Text>
                                        <Text style={{ fontSize: 15, color: 'black' }}>Cost: {item.cost}</Text>
                                    </View>
                                    {item.description != '' ?
                                        <View style={{ paddingVertical: 2, marginHorizontal: width * 0.05 }}>
                                            <Text style={{ fontSize: 15, color: 'black' }}>Description: {'\t'}{item.description}</Text>
                                        </View>
                                        :
                                        <View></View>
                                    }
                                    {index != section.data.length-1 ?
                                        <View style = {{marginTop: 6, height: 1, backgroundColor: 'rgba(20, 20, 20, 0.2)'}}></View>
                                        :
                                        <View/>
                                    }
                                </View>
                            )}
                    }
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={{ paddingVertical: 6, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'rgba(200, 250, 200, 0.6)' }}>
                            <Text style={{ color: "rgb(100, 100, 255)", fontSize: 19, fontFamily: 'sans-serif' }}>{title}</Text>
                        </View>
                    )}
                    sections={this.sectionListData(this.state.expenses)}
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