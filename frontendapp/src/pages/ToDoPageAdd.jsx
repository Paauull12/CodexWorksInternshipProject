import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/auth';

const TodoForm = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dependency, setDependency] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [existingTodos, setExistingTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await authenticatedFetch('/api/todos/');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.todo)) {

            setExistingTodos(data.todo.filter(
                todo => todo.status === 'notstarted' || todo.status === 'inprogress'
            ));
          }
        }
      } catch (error) {
        console.error('Error fetching todos for dependencies:', error);
      }
    };
    
    fetchTodos();
  }, []);
  
  const formatDateForInput = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0]; 
  };
  
  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    
    const todoData = {
      title: title.trim(),
      description: description.trim(),
      dependency: dependency ? parseInt(dependency) : null,
      due_date: formatDateForApi(dueDate),
      status: 'notstarted' 
    };
    
    try {
      const response = await authenticatedFetch('/api/todo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      
      if (response.ok) {
        setTitle('');
        setDescription('');
        setDependency('');
        setDueDate('');
        setSuccess('Todo created successfully!');
        
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create todo. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again later.');
      console.error('Error creating todo:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="bg-white rounded-lg shadow p-6 mb-6 mt-10">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Todo</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter todo title"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
            placeholder="Enter description"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="dependency" className="block text-sm font-medium text-gray-700 mb-1">
              Dependency
            </label>
            <select
              id="dependency"
              value={dependency}
              onChange={(e) => setDependency(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No dependency</option>
              {existingTodos.map((todo) => (
                <option key={todo.id} value={todo.id}>
                  #{todo.id} - {todo.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Todo'}
          </button>
        </div>
      </form>
    </div>
        </>
  );
};

export default TodoForm;