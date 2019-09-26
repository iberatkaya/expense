import React from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, StatusBar, Text, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Header } from 'react-navigation-stack';
import AsyncStorage from '@react-native-community/async-storage';
import {setDate} from './ExpenseActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height - Header.HEIGHT - StatusBar.currentHeight;


class Settings extends React.Component {

    static navigationOptions = {
        headerTitle: 'Settings'
    }

    constructor(props){
        super(props);
        this.state = {
            dateFormat: ''
        }
    }

    async componentDidMount(){
        var dateFormat = await AsyncStorage.getItem('@dateFormat');
        this.setState({dateFormat: dateFormat});
    }
    
    storeData = async (key, str) => {
        try {
            await AsyncStorage.setItem('@' + key, str);
        } catch (e) {
            console.log(e);
        }
    }

    render(){
        return (
            <ScrollView>
                <View style = {{flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(20, 20, 20, 0.2)', borderBottomWidth: 0.5, paddingVertical: 10}}>
                    <Text style = {{marginLeft: 20, fontSize: 16}}>Date Formatting: </Text>
                    <Picker 
                        style={{ width: 120}}
                        selectedValue={this.state.dateFormat}
                        onValueChange={(itemValue, itemIndex) => {
                            this.setState({dateFormat: itemValue});
                            this.storeData('dateFormat', itemValue);
                            this.props.setDate(itemValue);
                        }}>
                        <Picker.Item label = 'd/m' value = 'd/m' color = 'black' />
                        <Picker.Item label = 'm/d' value = 'm/d' color = 'black' />
                    </Picker>
                </View>
            </ScrollView>
        )
    }
}

const mapStateToProps = (state) => {
    const { date } = state;
    return { date };
};


const mapDispatchToProps = dispatch => (
    bindActionCreators({
      setDate,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Settings);