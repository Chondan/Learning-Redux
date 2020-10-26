// const { createStore, combineReducers } = Redux;
// const { connect, Provider } = ReactRedux;
import { createStore, combineReducers } from 'redux';
import { connect, Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

// REDUCERS
const todo = (state = {}, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
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
};
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
};
const visibilityFilter = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};
const todoApp = combineReducers({ todos, visibilityFilter });
const store = createStore(todoApp);
store.subscribe(() => console.log("updated: ", store.getState()));

// REACT COMPONENTS
let todoId = 0;

// ACTION CREATORS
const addTodoAction = (text) => {
  return {
    type: "ADD_TODO",
    id: todoId++,
    text,
    completed: false
  }
}
let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input ref={node => input = node} />
      <button
        onClick={() => {
          dispatch(addTodoAction(input.value));
          input.value = "";
          input.focus();
        }}
      >Add Todo</button>
    </div>
  );
}
AddTodo = connect()(AddTodo);

const Todo = ({
  id, text, completed, onClick
}) => {
  return (
    <li 
      style={{ textDecoration: completed ? "line-through" : "none" }}
      onClick={() => onClick()}
    >{text}</li>
  );
}

const TodoList = ({
  todos, onToggleTodo
}) => {
  return (
    <ul>
      {todos.map(todo => (
         <Todo 
           key={todo.id} 
           {...todo}
           onClick={() => onToggleTodo(todo.id)}
         >
        {todo.text}</Todo>
       ))}
    </ul>
  );
}

let VisibleTodos = ({
  todos, onToggleTodo
}) => {
  return (
    <TodoList todos={todos} onToggleTodo={onToggleTodo} />
  );
}
const getVisibleTodos = (todos, visibilityFilter) => {
  switch (visibilityFilter) {
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
const mapStateTodoToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
// ACTION CREATORS
const toggleTodoAction = (id) => {
  return {
    type: "TOGGLE_TODO", 
    id
  }
}
const mapDispatchTodoToProps = (dispatch) => {
  return {
    onToggleTodo: id => dispatch(toggleTodoAction(id))
  }
}
VisibleTodos = connect(mapStateTodoToProps, mapDispatchTodoToProps)(VisibleTodos);

const Link = ({
  children, filter, onClick, active
}) => {
   if (active) {
     return <span>{children}</span>;
   }
   return (
     <a href="#"
       onClick={() => onClick()}
     >{children}</a>
   );
}

let FilterLink = ({
  children, filter, onFilterClick, active
}) => {
  return (
    <Link
      filter={filter}
      onClick={() => onFilterClick(filter)}
      active={active}
    >{children}</Link>
  );
}
const mapStateFilterLinkToProps = (state, ownProps) => {
  return {
    active: state.visibilityFilter === ownProps.filter
  }
}
// ACTION CREATORS
const setFilterAction = (filter) => {
  return {
    type: "SET_VISIBILITY_FILTER",
    filter
  } 
}
const mapDispatchFilterLinkToProps = (dispatch) => {
  return {
    onFilterClick: filter => dispatch(setFilterAction(filter))
  }
}
FilterLink = connect(mapStateFilterLinkToProps, mapDispatchFilterLinkToProps)(FilterLink);

const Footer = () => {
  return (
    <div>
      <p>
        Show:{' '}
        <FilterLink filter="SHOW_ALL">All</FilterLink>{', '}
        <FilterLink filter="SHOW_ACTIVE">Active</FilterLink>{', '}
        <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
      </p>
    </div>
  );
}

class TodoApp extends React.Component {
  render() {
    return (
      <div>
         <h2>Todo App</h2>
         <AddTodo />
         <VisibleTodos />
         <Footer />
      </div>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <TodoApp />
  </Provider>,
  document.getElementById("todos-example")
);

console.log("Everything is fine");

export default TodoApp;