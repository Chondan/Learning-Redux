import React from 'react';
import { connect } from 'react-redux';

function Counter({ count, dispatch }) {
	return (
		<div>
			<h2>React Redux API</h2>
			<h2>{count}</h2>
			<button onClick={() => dispatch({ type: "decrement" })}>-</button>
			<button onClick={() => dispatch({ type: "increment" })}>+</button>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		count: state.count
	};
}

const WrappedCounter = connect(mapStateToProps)(Counter);

export { Counter,  WrappedCounter as default };