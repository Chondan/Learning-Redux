import React from 'react';
import { Counter } from './components';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const ACTIONS = {
	INCREMENT: "increment",
	DECREMENT: "decrement",
}

const initialState = {
	count: 0
}

const counterReducer = (state = initialState, action) => {
	switch (action.type) {
		case ACTIONS.INCREMENT:
			return {
				...state,
				count: state.count + 1
			}
		case ACTIONS.DECREMENT:
			return {
				...state,
				count: state.count - 1
			}
		default:
			return state;
	}
}

const store = createStore(counterReducer);

function App() {
	return (
		<Provider store={store}>
			<div>
				<h1>Learning Redux</h1>
				<Counter />			
				<br />
			</div>	
		</Provider>
	);
}

export default App;