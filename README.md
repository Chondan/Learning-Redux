# REDUX

Go to application: https://chondan.github.io/Learning-Redux

## ADDITIONALE RESOURCES
- jest.js (for testing)
- expect@latest
- deepfreeze@latest

---

TUTORIAL: [How Redux Works: A Counter-Example](https://daveceddia.com/how-does-redux-work/)

## Introduction
### What Does Redux Do? (and when should you use it?)

- It's About Data Flow
- Layers and Layers of Data Flow
	- Sooner or later you run into a situation where a top-level container has some data, and a child 4 levels down needs that data.
	- Getting the data down there is like threading a needle through a mining expedition.
	- Wait that doesn't make any sense. Anyway, it's a pain in the ass. 
	-More that that, it's not very good software design. Intermediate components in the chain must accept and pass along props that they don't care about. This means refactoring and reusing components from that chain will be harder that it needs to be.
> Wouldn't it be nice if the components that didn't need the data didn't have to see it at all?
- **Plug Any Data Into Any Comonent**
	- This is the problem that Redux solves. It gives components direct access to the data they need.
	- Using the `connedt` function that comes with Redux, you can plug any component into Redux's data store, and the component can pull out the data it requires.

For example: The `Avatar` Component
```JavaScript
import React from 'react';
import { connect } from 'react-redux';

const Avatar = ({ user }) => (
	<img src={user.avatar} />
);

const mapStateToProps = state => ({
	user: state.user
});

export { Avatar };
export default connect(mapStateToProps)(Avatar);
```

The component itself doesn't know about Redux - it just accepts a `user` prop and renders the avatar image. The `mapStateToProps` function extracts the `user` from Redux's store and maps it to the `user` prop. Finally, the `connect` function is what actually feeds the data from Redux through `mapStateToProps` and into `Avatar`.

You'll notice there are two exports at the end - a named one, and a default. This isn't strictly necessary, but it can be useful to have access to the raw component and the Redux-wrapped version of it.

The raw component is useful to have when writing unit tests, and can also increase reusability. For example, part of the app might want to render an `Avatar` for another user other that the signed-in user. In that case, you could even go a step further and export the Redux-connected version as CurrentUserAvatar to make the code cleaner.

### When To Add Redux?
If you have a component where props are being forwarded down through many layers - consider using Redux.

If you need to cached data between views - for instance, loading data when the user clicks on a detail page, and remembering the data so the next access is fast - consider storing that data in Redux.

If your app will be large, maintaining vast data, related and not - consider using Redux. But also consider starting without it, and adding it when you run into a situation where it will help.

---

## How Redux Works: A Counter-Example

> Terminolog: actions, reducers, action creators, middleware, pure functions, immutability...

### On to the React Redux Example
Redux keeps the state of your app in a single store. Then, you can extract parts of that state and plug it into your components as props. This lets you keep data in one global place (the store) and feed it directly to any component in the app, without the gymnastics of passing props down multiple levels.

Side note: you'll often see the words "state" and "store" used interchangably. Technically, the **state** is the data, and the **store** is where it's kept.

> Add Redux to the project: `npm install react-redux`

### redux vs react-redux
See, `redux` gives you a store, and lets you keep state in it, and get state out, and respond when the state changes. But that's all it does.

It's actually `react-redux` that lets you **connect** pieces of the state to React components. That's right: `redux` knows nothing about React at all. 

These libraries are like two peas in a pod. 99.99% of the time, when anyone mentions "Redux" in the context of React, they are referring to both of these libraries in tandem.

### Last Things First
Most tutorials start by creating a store, setting up Redux, writing a reducer, and so on. Lots much happen before anything appears on screen.

I'm going to take a backwards approach, and it will take just as much code to make thins appear on screen, but hopefully the motivation behind each step will be clearer.

EXAMPLE APP: COUNTER APP

### Wiring Up The Counter
To get the count out of Redux, we first need to import the `connect` function at the top.

```JavaScript
import { connect } from 'react-redux';
```

Then we need to `connect` the Counter component to Redux at the bottom

```JavaScript
// Add this function
function mapStateToProps(state) {
	return {
		count :state.count
	};
}

// Then replac this: export default Counter 

// With This
export default connect(mapStateToProps)(Counter);
```

Where previously we were exporting the component itself, now we're wrapping it with this `connect` function call.

### What's `connect`?
You might notice that call looks little... weird. 

It's written this way because `connect` is a *higher-order function*, which is a fancy way of saying it returns a function when you call it. And then calling that function with a component returns a new (wrapped) component.

What `connect` does is hook into Redux, pull out the entire state, and pass it through the `mapStateToProps` function that you provide. This needs to be a custom function because only you will know the "shape" of the state in Redux.

`connect` passes the entire state as if to say, "Hey, tell me what you need out of this jumbled mess"

The object you return from `mapStateToProps` gets fed into your component as props.

### Errors Mean Progress!
If you're following along, you will see an error saying 

> Could not find "store" in either the context or props of "Connect(Counter)"...

Since `connect` pulls data from the Redux store, and we haven't set up a store or told the app how to find it, this error is pretty logical. Redux has no dang idea what's going on right now.

### Provide a Store
Redux holds the global state for the entire app, and by wrapping the entire app with the `Provider` component from `react-redux`, every component  in the app tree will be able to use `connect` to access the Redux store if it wants to. 

This means `App`, and children of `App` (like `Counter`), and children of their children, and so on - all of them can now access the Redux store, but only if they are explicity wrapped by a call to `connect`.

I'm not saying to actually do that - `connect`ing every single component would be a bad idea (messy design, and slow too).

This `Provider` thing might seem like total magic right now. It is a little bit; it actually uses React's `context` feature under the hood.

It's like a secret passageway connected to every component, and using `connect` opens the door to the passageway.

Imagine pouring syrup on a pile of pancakes, and howit manages to make its way into ALL the pancakes even though you just poured it on the top one. `Provider` does that for Redux.

> In `src/index.js`, import the `Provider` and wrap the contents of `App` with it.

```JavaScript
import { Provider } from 'react-redux';
const App = () => (
	<Provider>
		<Counter />
	</Provider>	
)
```

We're still getting that error though - that's because `Provider` needs a store to work with. It'll take the store as a prop, but we need to create one first.

### Create the Store
Redux comes with a handy function that creates stores, and it's called `createStore`. Yep. Let's make a store and pass it to Provider

```JavaScript
import { createStore } from 'redux';
const store = createStore();
const App = () => (
	<Provider store={store}>
		<Counter />
	</Provider>
);
```

Another error, but different this time:

> Expected the reducer to be a function.

So, here's the thing about Redux: it's not very smart. You might expect that by creating a store, it would give you a nice default value for the state inside that store. Maybe an empty object?

But no: Redux makes zero assumptions about the shape of your state. It's up to you! It could be an object, or a number, or a string, or whatever you need. 

So we have to provide a function that will return the state. That function is called a **reducer**. So let's make the simplest one possible, pass it into `createStore`, and see what happens:

```JavaScript
const store = createStore(reducer);
```

### The Reducer Should Always Return Something
The error is different now: 

> Cannot read property 'count' of undefined

It's breaking because we're tring to access `state.count`, but state is undefined. Redux expected our `reducer` funtion to return a value for `state`, except that it (implicity) returned `undefined`. Things are rightfully broken.

The reducer is expected to return the state. It's actually supposed to take the current state and return the new state, but nevermind; we'll come back to that.

Let's make the reducer return something that matches the shape we need: an object with a `count` property.

```JavaScript
function reducer() {
	return {
		count: 42,
	};
}
```

Hey! It works! The count now appears as "42". Awesome.

Just one thing though: the count is forever stuch at 42.

### The Story So Far
Before we get into how to actually update the counter, let's look at what we've done up till now:
- We wrote a `mapStateToProps` function that does what the name says: transforms the Redux state into an object containing props.
- We connected the Redux store to our `Counter` component with the `connect` function from `react-redux`, using the `mapStateToProps` function to configure how the connection works.
- We created a `reducer` function to tell Redux what our state whould look like.
- We used the ingeniously-named `createStore` function to create a store, and passed it the `reducer`
- We wrapped our whole app in the `Provider` component that comes with `react-redux`, and passed it our sotre as a prop.
- The app works flawlessly, except the fact that the counter is stuck at 42.

### Interactivity (Making It Work)
So far this is pretty lame, I know. You could've written a static HTML page with the number "42" and 2 broken buttons in 60 seconds flat, yet here you are, reading how to overcomplicate that very same thing with React and Redux and who knows what else.

A simple Counter app is a great teaching tool, but Redux is absolutely overkill for something like this. React state is perfectly fine for something so simple. Heck, even plain JS would work great. Pick the right tool for the job. Redux is not always that tool. But I digress.

### Initial State
So we need a way to tell Redux to change the counter.

Remember the `reducer` function we wrote? 

Remember how I mentioned it takes the current state and returns the new state? Well, I lied again. It actually takes `the current state` and `an action`, and then it returns the new state. We should have written it like this: 

```JavaScript
function reducer(state, action) {
	return {
		count: 42,
	};
}
```

The very first time Redux calls this function, it will pass `undefined` as the `state`. That is your cue to return the *initial state*. For us, that's probably an object with a `count` of 0.

It's common to write the initial state above the reducer, and use ES6's default argument feature to provide a value for the `state` argument when it's undefined.

```JavaScript
const initialState = {
	count: 0,
};
function reducer(state = initialState, action) {
	return state;
}
```

### Action
We're finally ready to talk about the `action` parameter. What is it? Where does it come from? How can we use it to change the damn counter?

An "action" is a JS object that describes a change that we want to make. The only requirement is that the object needs to have a `type` property, and its value should be a string. Here's an example of an action:

```JavaScript
{
	type: "INCREMENT"
}
```

Here's another one:

```JavaScript
{
	type: "DECREMENT"
}
```

### Respond to Actions
Remember the reducer's job is to take the current state and an action and figure out the new state. So if the reducer received an action like `{ type: "INCREMENT" }`, what might you want to return as the new state?

If you answered something like this, you're on the right track:

```JavaScript
function reducer(state = initialState, action) {
	if (action.type === "INCREMENT") {
		return {
			count: state.count + 1
		};
	}
	return state;
}
```

It's common to use a `switch` statement with `case`s for each action you want to handle. Change your reducer to look like this:

```JavaScript
function reducer(state = initialState, action) {
	switch (action.type) {
		case "INCREMENT":
			return {
				count: state.count + 1
			};
		case "DECREMENT":
			return {
				count: state.count - 1
			};
		default: 
			return state;
	}
}
```

### Always Return a State
You'll notice that there's always the *fallback* case where all it does is `return state`. This is important, because Redux can (will) call your reducer with actions that it doesn't know what to do with. In fact, the very first action you'll receive is `{ type: "@@redux/INIT" }`. Try putting a `console.log(action)` above the `switch` and see.

Remember that the render's job is to return a new state, even if that state is unchanged from the current one. You never want to go from "having a state" to "state = undefined", right? That's what would happen if you left off the `default` case. Don't do that.

### Never Change State
One more thing to never do: do not mutate the `state`. State is immutable. you must never change it. **That means you can't do this:**

```JavaScript
function brokenReducer(state = initialState, action) {
	switch (action.type) {
		case "INCREMENT":
			// NO! BAD: this is changing state!
			state.count++;
			return state;
		case "DECREMENT":
			// NO! BAD: this is changing state too!
			state.count--;
			return state;
		default:
			// this is fine.
			return state;
	}	
}

```

You also can't do things like `state.foo = 7`, or `state.items.push(newItem)`, or `delete state.something`.

Think of it like a game where the only thing you can do is `return {...}`. It's a fun game. Maddening at first. But you'll get better at it with practice.

### All These Rules...
Always return a state, never change state, don't connect every component, eat your broccoli, don't stay out pass 11... it's exhausting. It's like a rules factory, and I don't even know what that is.

Yeah, Redux can be like an overbearing parent. But it comes from a place of love. Functional programming love.

Redux is built on the idea of immutability, because mutating global state is the road to ruin.

Have you ever kept a global object and used it to pass state around an app? It works great at first. Nice and easy. And then the state starts changing in unpredictable ways and it becomes impossible to find the code that's changing it.

Redux avoids these problems with some simple rules. State is read-only, and actions are the only way to modify it. Changes happen one way, and one way only: 

> action -> reducer -> new state

The reducer must be "pure" - it cannot modify its arguments.

There are even addon packages that let you log every action that comes through, rewind and replay them, and anything else you could imagine. Time-travel debugging was one of the original motivations for creating Redux.

### Where Do Actions Come From?
One piece of this puzzle remains: we need a way to feed an action into our reducer function so that we can increment and decrement the counter.

Actions are not born, but they are **dispatched**, with a handy function called `dispatch`.

The `dispatch` function is provided by the instance of the Redux store. 

That is to say, you can't just `import { dispatch }` and be on your way. You can call `store.dispatch(someAction)`, but that's not very convenient since the `store` instance is only available in one file.

As luck would have it, the `connect` function has our back. 

In addition to injecting the result of `mapStateToProps` as props, `connect` also injects the `dispatch` function as prop. And with that bit of knowledge, we can finally get the counter working again.

Here is the final component in all its glory. If you've been following along, the only things that changed are the implementations of `increment` and `decrement`: they now call the `dispatch` prop, passing it an action.

```JavaScript
import React from 'react';
import { connect } from 'react-redux';

class Counter extends React.Component {
	increment = () => {
		this.props.dispatch({ type: "increment" });
	}
	decrement = () => {
		this.props.dispatch({ type: "decrement" });
	}

	render() {
		return (
			<div>
				<h2>Counter</h2>
				<button>-</button>
				<span>{this.props.count}</span>
				<button>+</button>
			</div>	
		);
	}
}

function mapStateToProps() {
	return {
		count: state.count
	};
}

export default connect(mapStateToProps)(Counter);

```

### What Now?
With the Counter app under your belt, you are well-equipped to learn more about Redux.

> "What?! There's more?!"

There is much I haven't covered here, in hopes of making this guide easily digestible - action constants, action creators, middleware, thunks and asynchronous calls, selectors, and on and on. There's a lot.

But you've got the basic idea now. Hopefully you understand how data flows in Redux (`dispatch(action) -> reducer -> new state -> re-render`), and what a reducer does, and what an action is, and how that all fits together.

--- 

# Getting Started with Redux - Video Series by Dan Abramov, the creator of Redux

## Redux: The Single Immutable State Tree

> Everything that changes in your application, including the data and the UI state, is contained in a single object, we call the state or the state tree.

## Redux: Describing State Changes with Actions

> The state is read only. The only way to change the state tree is by dispatching an action. An actino is a plain JavaScript object, describing in the minimal way what changed in the application.

## Redux: Pure and Impure Function

## Redux: The reducer Function

> To describe state mutations, you have to write a function that takes the previous state of the app, the action being dispatched, and returns the next state of the app. This function has to be pure. This function is called the "Reducer".

## Redux: Store Methods: getState(), dispatch(), and subscribe()

`npm install redux`

```JavaScript
import { createStore } from 'redux';

const counter = (state = 0, action) => {
	switch (action.type) {
		case "INCREMENT":
			return state + 1;
		case "DECREMENT":
			return state - 1;
		default:
			return state;
	}
}
const store = createStore(counter); 

```

There store has 3 important methods
1. getState() -> return the current state of redux store
2. dispatch() -> let you dispatch action to change the state of your application
3. subscribe() -> It let you register a callback that the redux store always call every time an action has been dispatched.

Example
```JavaScript
const render = () => {
	// get the state
	document.body.innerText = store.getState();
}

render();
store.subscribe(render); // Tracking the change

// dispatch an action
document.addEventListener('click', () => {
	store.dispatch({ type: "increment" });
});
```

## Redux: Implementing store from Scratch

## Redux: Reducer Composition with Arrays
We extracted the to-do reducer from the to-dos reducer, so now we need to call if for every to-do, and assemble the results into an array. 

Different reducers specify how different parts of the trait tree are updated in response to actions. Reducers are also normal JavaScript function, so they can call other reducers to delegate and abstract a way of handling of updates of some parts of this tree they manage.

## Redux: Reducer Composition with Objects

## Redux: Reducer Composition with combineReducers()

```JavaScript
import { combineReducers } from 'redux';
const todoApp = combineReducers({
	todos: todos,
	visibilityFilter: visibilityFilter
});
```

The only argument to combine reducers is an object. This object lets me specify the mapping between the straight field names, and the reducers managing them.

## Redux: Implementing combineReducers() from Scratch

```JavaScript

const combineReducers = (reducers) => {
	return (state = {}, action) => {
		return Objects,keys(reducers).reduce((nextState, key) => {
			nextState[key] = reducers[key](state[key], action);
			return nextState;
		}, {});
	}
}

```

## Redux: Extracting Presentational Components
Presentational component doesn't know what todo (we need to send an event handle to it). It does not define any behaviours.

## Redux: Extracting Container Components
- Container Components => receive the state and subscribe the state by itself, contains logic for passing through the presentational components

## Redux: Passing the Store Down Explicity via Props

## Redux: Passing the Store Down Explicity vis Context
```JavaScript
const StoreContext = React.createContext({ store: myStore });
class Provider extends React.Component {
	render() {
		return (
			<StoreContext.Provider value={{ store: this.props.store }}>
				{this.props.children}
			</StoreContext.Provider>
		);
	}
};
function App() {
	return (
		<Provider store={myStore}>
			<Component1 />
			<Component2 />
		</Provider>
	);
}
```

## Redux: Generating Containers with connect() from React Redux
```JavaScript
AddTodo = connect(
	state => {
		return {};
	},
	dispatch => {
		return { dispatch };
	}
)(AddTodo);
```

In this above case, we don't need to subscribe to the store to get the state, and we also don't need any callbcak function.

By default we can leave both argument blank value, and the connect() will send dispatch object to the component automatically.

```JavaScript
AddTodo = connect()(AddTodo);
```

But for this case for VisibleTodoList (for toggling a todo), we need a call back function.

```JavaScript
const mapStateToProps = (state) => {
	return {
		todos: getVisibleTodo(state.todos, state.visibilityFilter)
	}
};
const mapDispatchToProps = (dispatch) => {
	return {
		onTodoClick: (id) => dispatch({ type: "TOGGLE_TODO": id })
	}
}
VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(VisibleTodoList);
```

For another case we can do something with Component's props to inject the specify state to the WrappedComponent's props

```JavaScript
const mapStateToProps = (state, ownProps) => {
	return {
		active: ownProps.filter === state.visibilityFilter
	};
};
const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onClick: () => dispatch({ type: "SETVISIBILITY_FILTER", filter: ownProps.filter })
	};
};
const WrappedLinkComponent = connect(mapStateToProps, mapDispatchToProps)(LinkComponent);
```

## Redux: Extracting Action Creators
Action creators return the action that needs to be dispatched. It takes arguments about the action and it returns the action object.

