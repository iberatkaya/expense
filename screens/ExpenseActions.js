export const addExpense = expense => (
    {
      type: 'ADD_EXPENSE',
      payload: expense
    }
);

export const setExpense = expense => (
  {
    type: 'SET_EXPENSE',
    payload: expense
  }
);

export const deleteExpense = expense => (
    {
      type: 'DELETE_EXPENSE',
      payload: expense
    }
);


export const setDate = date => (
  {
    type: 'SET_DATE',
    payload: date
  }
)