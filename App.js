import React from "react";
import AppNavigator from './AppNav';
import SQLite from 'react-native-sqlite-2';
const db = SQLite.openDatabase("expenses.db", '1.0', '', 1);
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import expenseReducer from './screens/ExpenseReducer';
import { useScreens } from 'react-native-screens';

useScreens();

const store = createStore(expenseReducer);


export default class App extends React.Component {

  render() {
    return (
      <Provider store={ store }>
        <AppNavigator/>
      </Provider>
    );
  }
}
