const createStore = (reducer) => {
  let state, listeners = [];
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

const combineReducers = (reducers) => {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action);
      return nextState;
    }, {})
  }
}

const todo = (state = {}, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case "TOGGLE_TODO":
      if (state.id === action.id) {
        return {
          ...state,
          completed: !state.completed
        };
      }
      return state;
    default:
      return state;
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state, 
        todo(null, action)
      ];
    case "TOGGLE_TODO":
      return state.map(s => todo(s, action));
    default:
      return state;
  }
}

const visibilityFilter = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
}

const todoApp = combineReducers({ todos, visibilityFilter });
const myStore = createStore(todoApp);
myStore.subscribe(() => {
  console.log("updated: ", myStore.getState());
})

//----------------------------------

const Todo = ({
  onClick, completed, text
}) => (
  <li
    onClick={onClick}
    style={{ textDecoration: completed ? "line-through" : "none" }}
  >
  {text}
  </li>
);

const TodoList = ({
  todos, onTodoClick
}) => (
  <ul>
    {todos.map(todo => (
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      /> 
    ))}
  </ul>
);

const getVisibleTodos = (todos, visibility) => {
  switch (visibility) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_ACTIVE":
      return todos.filter(todo => todo.completed === false);
    case "SHOW_COMPLETED":
      return todos.filter(todo => todo.completed === true);
    default:
      return todos;
  }
}

const StoreContext = React.createContext(myStore);

const AddTodo = () => {
  const { store } = React.useContext(StoreContext);
  let input;
  return (
    <div> 
      <input
        type="text"
        ref={node => input = node}
      />
      <button
        onClick={() => {
          store.dispatch({ type: "ADD_TODO", id: todoId++, text: input.value });
          input.value = "";
          input.focus();
        }}
      >
      Add Todo
      </button>
    </div>
  );
};

const Link = ({
  active, children, onClick
}) => {
  if (active) {
    return <span>{children}</span>
  }
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}    
    >
      {children}
    </a>
  );
};

class FilterLink extends React.Component {
  static contextType = StoreContext;
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    const { store } = this.context;
    const props = this.props;
    const state = store.getState();
    return(
      <Link
        active={
          props.filter === state.visibilityFilter
        }
        onClick={() => store.dispatch({ type: "SET_VISIBILITY_FILTER", filter: props.filter })}
      >
        {props.children}
      </Link>       
    );
  }
}

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink 
       filter="SHOW_ALL"
    >
      All
    </FilterLink>
    {', '}
    <FilterLink 
       filter="SHOW_ACTIVE"
    >
      Active
    </FilterLink>
    {', '}
    <FilterLink 
       filter="SHOW_COMPLETED"
    >
      Completed
    </FilterLink>
  </p>
);


class VisibleTodoList extends React.Component {
  static contextType = StoreContext;
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }
  componentWillUnMount() {
    this.unsubscribe();
  }
  render() {
    const { store } = this.context;
    const props = this.props;
    const state = store.getState();
    return (
      <TodoList
        todos={getVisibleTodos(state.todos, state.visibilityFilter)}
        onTodoClick={id => store.dispatch({ type: "TOGGLE_TODO", id })}
      />
    );
  }
}

let todoId = 0;
const TodoApp = () => { 
  return (
    <div>
      <AddTodo />
      <VisibleTodoList />
      <Footer />
    </div>
  );
}

class Provider extends React.Component {
  render() {
    return (
      <StoreContext.Provider value={{ store: this.props.store }}>
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}

ReactDOM.render(
  <Provider store={myStore}>
    <TodoApp />
  </Provider>, 
  document.getElementById("root")
);

console.log("Everything look fine");
