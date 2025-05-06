import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authenticatedFetch } from '../utils/auth';

const TodoBoard = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await authenticatedFetch('/api/todos/');
        if (response.ok) {
          const data = await response.json();
          
          if (data && Array.isArray(data.todo)) {
            setTodos(data.todo);
          } else {
            console.error('Unexpected data format:', data);
            setTodos([]);
          }
        } else {
          console.error('Failed to fetch todos');
          setTodos([]);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTodos();
  }, []);
  
  const sortByDueDate = (a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    
    return new Date(a.due_date) - new Date(b.due_date); // Fixed sort order
  };
  
  const notStartedTodos = Array.isArray(todos) 
    ? todos
        .filter(todo => todo.status === 'notstarted')
        .sort(sortByDueDate)
    : [];
    
  const inProgressTodos = Array.isArray(todos) 
    ? todos
        .filter(todo => todo.status === 'inprogress')
        .sort(sortByDueDate)
    : [];
    
  const doneTodos = Array.isArray(todos) 
    ? todos
        .filter(todo => todo.status === 'done')
        .sort(sortByDueDate)
    : [];
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const TodoCard = ({ todo }) => {
    return (
      <Link to={`/todo/${todo.id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 line-clamp-1">{todo.title}</h3>
            <span className="text-xs text-gray-500 font-mono">#{todo.id}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{todo.description}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              {todo.due_date && (
                <span className="text-xs text-gray-500">
                  {formatDate(todo.due_date)}
                </span>
              )}
            </div>
            
            {todo.dependency && (
              <div className="text-xs text-gray-500">
                Depends on #{todo.dependency}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };
  
  const Column = ({ title, todos, bgColor }) => {
    return (
      <div className="flex-1 min-w-0 p-2">
        <div className={`${bgColor} text-sm font-medium px-4 py-2 rounded-full inline-flex mb-4`}>
          {title} {todos.length > 0 && <span className="ml-1">({todos.length})</span>}
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {todos.map(todo => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
          {todos.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Column 
              title="Not Started" 
              todos={notStartedTodos}
              bgColor="bg-gray-100 text-gray-700" 
            />
            <Column 
              title="In Progress" 
              todos={inProgressTodos}
              bgColor="bg-blue-100 text-blue-700" 
            />
            <Column 
              title="Done" 
              todos={doneTodos}
              bgColor="bg-green-100 text-green-700" 
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TodoBoard;