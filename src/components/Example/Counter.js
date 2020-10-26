import React from 'react';
import ReactDOM from 'react-dom';

const createStore = (reducer) => {
	let state;
	let listeners = [];

	const getState = () => state;

	const dispatch = (action) => {
		state = reducer(state, action);
		listeners.forEach(listener => listener());
	}

	const subscribe = (listener) => {
		listeners.push(listener);
		return () => {
			listeners = listeners.filter(l => l !== listener);
		}
	}

	dispatch({});

	return { getState, dispatch, subscribe };
}

const counterReducer = (count = 0, action) => {
	switch (action.type) {
		case "increment":
			return count + 1;
		case "decrement":
			return count - 1;
		default:
			return count;
	}
}

const store = createStore(counterReducer);
console.log(store.getState());

const render = () => {
	ReactDOM.render(<Counter
		count={store.getState()}
		onIncrement={() => store.dispatch({ type: "increment" })}
		onDecrement={() => store.dispatch({ type: "decrement" })}
	 />, document.getElementById("counter-example"));
}

render();
store.subscribe(render);
store.subscribe(() => {
	console.log("updated: ", store.getState());
})

function Counter({ count, onIncrement, onDecrement }) {
	return (
		<div>
			<h2>React Redux Manual</h2>
			<h2>{count}</h2>
			<button onClick={onDecrement}>-</button>
			<button onClick={onIncrement}>+</button>
			<br />
		</div>
	);
}

export default Counter;
