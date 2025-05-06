import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/auth';

const TodoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [todo, setTodo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [dependency, setDependency] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [existingTodos, setExistingTodos] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const todoResponse = await authenticatedFetch(`/api/todo/${id}/`);
        
        if (todoResponse.ok) {
          const todoData = await todoResponse.json();
          setTodo(todoData.todo);
          
          setTitle(todoData.todo.title);
          setDescription(todoData.todo.description || '');
          setStatus(todoData.todo.status);
          setDependency(todoData.todo.dependency || '');
          setDueDate(todoData.todo.due_date ? new Date(todoData.todo.due_date).toISOString().split('T')[0] : '');
        } else {
          const errorData = await todoResponse.json();
          setError(errorData.error || 'Failed to load todo details');
          navigate('/todos');
        }
        
        const todosResponse = await authenticatedFetch('/api/todos/');
        if (todosResponse.ok) {
          const todosData = await todosResponse.json();
          if (todosData && Array.isArray(todosData.todo)) {
            setExistingTodos(todosData.todo.filter(
              t => t.id !== parseInt(id) && (t.status === 'notstarted' || t.status === 'inprogress')
            ));
          }
        }
      } catch (err) {
        setError('Network error. Please try again later.');
        console.error('Error fetching todo details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString();
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');
    
    if (!title.trim()) {
      setError('Title is required');
      setUpdateLoading(false);
      return;
    }
    
    const todoData = {
      title: title.trim(),
      description: description.trim(),
      status: status,
      dependency: dependency ? parseInt(dependency) : null,
      due_date: formatDateForApi(dueDate)
    };
    
    try {
      const response = await authenticatedFetch(`/api/todo/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodo(updatedTodo.todo);
        setSuccess('Todo updated successfully!');
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update todo. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again later.');
      console.error('Error updating todo:', error);
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }
    
    setUpdateLoading(true);
    try {
      const response = await authenticatedFetch(`/api/todo/${id}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        navigate('/todos', { replace: true });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete todo');
        setUpdateLoading(false);
      }
    } catch (error) {
      setError('Network error. Please try again later.');
      console.error('Error deleting todo:', error);
      setUpdateLoading(false);
    }
  };
  
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'None';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const isDone = todo?.status === 'done';
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error && !todo ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3">
              {error}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-medium text-gray-900">Todo #{id}</h1>
                <div className="text-sm text-gray-500">
                  {!isEditing && `Status: ${todo?.status || ''}`}
                </div>
              </div>
              
              {!isEditing ? (
                <div className="flex space-x-3">
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100"
                    >
                      Edit
                    </button>
                  )}
                  {!isDone && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={updateLoading}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100"
                    >
                      Delete
                    </button>
                  )}
                  {isDone && (
                    <div className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-md">
                      Completed - Cannot Edit
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {error && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
            
            {success && (
              <div className="px-6 py-3 bg-green-50 border-b border-green-200">
                <div className="text-sm text-green-800">{success}</div>
              </div>
            )}
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleUpdate}>
                  <div className="space-y-6">
                    <div>
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
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="4"
                        placeholder="Enter description"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="notstarted">Not Started</option>
                          <option value="inprogress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      
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
                        disabled={updateLoading}
                        className={`px-4 py-2 rounded-md text-white font-medium ${
                          updateLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {updateLoading ? 'Updating...' : 'Update Todo'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">{todo?.title}</h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {todo?.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            todo?.status === 'notstarted' ? 'bg-gray-100 text-gray-800' :
                            todo?.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {todo?.status === 'notstarted' ? 'Not Started' :
                             todo?.status === 'inprogress' ? 'In Progress' : 'Done'}
                          </span>
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                        <dd className="mt-1 text-gray-900">
                          {todo?.due_date ? formatDisplayDate(todo.due_date) : 'No due date'}
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Dependency</dt>
                        <dd className="mt-1 text-gray-900">
                          {todo?.dependency ? `Todo #${todo.dependency}` : 'None'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate('/todos')}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Back to Todos
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoDetailPage;