import { combineReducers } from 'redux';

const INITIAL_STATE = {
    expenses: []
};

const expenseReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'ADD_EXPENSE':      
            return Object.assign({}, state, {
                expenses: state.expenses.concat(action.payload)
            });
    case 'SET_EXPENSE':      
            return Object.assign({}, state, {
                expenses: action.payload
            });
    case 'DELETE_EXPENSE':      
            return Object.assign({}, state, {
                expenses: state.expenses.filter((i) => i !== action.payload)
            });
    default:
      return state;
  }
};


const dateReducer = (state = {date: 'd/m'}, action) => {
    switch (action.type) {
      case 'SET_DATE':      
              return Object.assign({}, state, {
                  date: action.payload
              });
      default:
        return state;
    }
  };

export default combineReducers({
    expenses: expenseReducer,
    date: dateReducer
});