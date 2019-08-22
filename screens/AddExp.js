import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Dimensions, StatusBar, ToastAndroid} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Select from 'react-native-picker-select';
import t from 'tcomb-form-native';
import {Header} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import moment  from 'moment';
const Form = t.form.Form;
var _ = require('lodash');
const stylesheet = _.cloneDeep(t.form.Form.stylesheet);
import {expenseTypes} from './consts';
import SQLite from 'react-native-sqlite-2';
const db = SQLite.openDatabase("expenses.db", '1.0', '', 1);
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addExpense } from './ExpenseActions';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height - Header.HEIGHT - StatusBar.currentHeight;

const Money = t.refinement(t.String, money => {
    const reg = /^(\d+(?:[\.\,]\d{2})?)$/;
    return reg.test(money);
});


const Expense = t.struct({
    cost: Money,
    date: t.Date,
    description: t.maybe(t.String)
});

stylesheet.textbox.normal.color = '#000000';
stylesheet.textbox.normal.borderColor = "#000000";
stylesheet.textbox.normal.borderWidth = 0;
stylesheet.textbox.normal.borderBottomWidth = 1;
stylesheet.textbox.normal.fontSize = 18;
stylesheet.textbox.normal.paddingHorizontal = 4;
stylesheet.textbox.error.color = '#000000';
stylesheet.textbox.error.borderColor = "#D00000";
stylesheet.textbox.error.borderWidth = 0;
stylesheet.textbox.error.borderBottomWidth = 1;
stylesheet.textbox.error.fontSize = 18;
stylesheet.textbox.error.paddingHorizontal = 4;
stylesheet.controlLabel.normal.color = "#000000";
stylesheet.controlLabel.normal.fontWeight = "300";
stylesheet.controlLabel.error.color = "#D00000";
stylesheet.controlLabel.error.fontWeight = "300";
stylesheet.errorBlock.color = "#D00000";

class AddExp extends React.Component{

    static navigationOptions = {
        headerTitle: 'Add Expense'
    }

    constructor(props){
        super(props);
        this.state = {
            expenses: expenseTypes.map((i) => {
                return {value: i, label: i, color: '#555'};
              }),
            value: {
                date: new Date()
            },
            expenseType: null,
            dateFormat: 'd/m'
        };
    }

    
    onChange = (value) => {
        this.setState({ value: value });
    }

    insertToDB = (obj, type) => {
        db.transaction(tx => {
            tx.executeSql('INSERT INTO EXPENSE (description, type, cost, date) VALUES(?, ?, ?, ?)', [obj.description == null ? '' : obj.description, type, obj.cost, Date.parse(obj.date)], (tx, res) => { }, (tx, err) => {console.log(err);});
            this.props.addExpense(obj);
        });
    }
    options = {
        i18n: {
            optional: '',   // suffix added to optional fields
            required: ''
        },
        stylesheet: stylesheet,
        fields: {
            cost: {
                label: "Cost",
                keyboardType: 'numeric',
                error: 'Please enter a valid cost.',
                placeholder: "Ex. 5.95",
                maxLength: 7
            },
            date: {
                label: "Date (Tap to select)",
                error: 'Please select a date.',
                mode: 'date',
                maximumDate: new Date(),
                minimumDate: new Date(2000, 0, 1),
                config: {
                  format: (date) => {
                    var str = this.props.date.date == 'm/d' ?
                        moment(date).format('MM/DD/YYYY')
                    :
                        moment(date).format('DD/MM/YYYY');
                    return str;
                  },
                  dateFormat: (date) => {
                    var str = this.props.date.date == 'm/d' ?
                        moment(date).format('MM/DD/YYYY')
                    :
                        moment(date).format('DD/MM/YYYY');
                    return str;
                  },
                }
            },
            description: {
                multiline: true,
                stylesheet: {
                  ...Form.stylesheet,
                  textbox: {
                    ...Form.stylesheet.textbox,
                    normal: {
                      ...Form.stylesheet.textbox.normal,
                      height: 160,
                      textAlignVertical: 'top',
                      paddingVertical: 6,
                      paddingHorizontal: 10
                    },
                  },
                },
                label: "Description",
                type: 'textarea',
                autoCapitalize: 'sentences',  
                placeholder: "",
            },
        }
    }

    render(){
        return(
            <View style = {{ paddingHorizontal: 12, backgroundColor: '#f9f9f9'}}>
                <ScrollView contentContainerStyle = {{height: height}}>
                    <View 
                        style = {{
                            marginTop: 10,
                            marginBottom: 16,
                            alignSelf: 'center',
                            borderRadius: 12,
                            backgroundColor: '#f0f0f0',
                            width: width * 0.8
                        }}
                    >
                        <Select
                            placeholderTextColor = '#555' 
                            placeholder = {{label: 'Select an expense', value: null}}
                            onValueChange  = {(val) => this.setState({expenseType: val})}
                            items = {this.state.expenses}
                        />
                    </View>
                    <Form
                        ref={(ref) => { this.form = ref; }}
                        value={this.state.value}
                        options={this.options}
                        type={Expense}
                        onChange={this.onChange}
                    />
                </ScrollView>
                <TouchableOpacity
                    style={{
                        elevation: 1,
                        position: 'absolute',
                        bottom: 22,
                        right: 18,
                        borderWidth: 1,
                        borderColor:'rgba(0,220,0,0.3)',
                        alignItems:'center',
                        justifyContent:'center',
                        width: 64,
                        height: 64,
                        backgroundColor:'#fff',
                        borderRadius:100,
                    }}
                    onPress = {() => {
                        if(this.state.expenseType == null){
                            ToastAndroid.show('Select an expense type', ToastAndroid.SHORT);
                            return;
                        }
                        const val = this.form.getValue();
                        if(val != null){
                            let tempobj = {
                                date: new Date(val.date),
                                cost: parseFloat(parseFloat(val.cost).toFixed(2)),
                                description: val.description == null ? '' : val.description,
                                type: this.state.expenseType
                            }
                            this.props.navigation.pop();
                            this.insertToDB(tempobj, this.state.expenseType);
                        }
                    }}
                >
                    <Icon name="check" size={30} color="rgb(60, 200, 60)" />
                </TouchableOpacity>
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
      addExpense,
    }, dispatch)
  );
  

export default connect(mapStateToProps, mapDispatchToProps)(AddExp);
