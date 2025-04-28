import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PlusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { StrictModeDroppable } from "./StrictModeDroppable";
import { fetchWithAuth } from "../../api/auth";

const API_BASE_URL =
  "https://test-service-dev-1084792667556.us-central1.run.app";

export default function KanbanBoard({ boardData }) {
  const [columns, setColumns] = useState({});
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddStateModal, setShowAddStateModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("member");
  const [newStateName, setNewStateName] = useState("");
  const [newStateColor, setNewStateColor] = useState("bg-gray-100");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (boardData && boardData.boardRequest && boardData.boardRequest.columns) {
      const transformedColumns = {};
      boardData.boardRequest.columns.forEach((column) => {
        transformedColumns[
          column.columnName.toLowerCase().replace(/\s+/g, "")
        ] = {
          id: column.columnName.toLowerCase().replace(/\s+/g, ""),
          title: column.columnName,
          color: getColumnColor(column.columnName),
          tasks: [], // Initialize with empty tasks array
        };
      });
      setColumns(transformedColumns);
      setLoading(false);
    }
  }, [boardData]);

  const getColumnColor = (columnName) => {
    switch (columnName.toLowerCase()) {
      case "to do":
        return "bg-blue-100";
      case "in progress":
        return "bg-yellow-100";
      case "in review":
        return "bg-purple-100";
      case "done":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get source and destination columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Create new arrays for the tasks
    const sourceItems = Array.from(sourceColumn.tasks);
    const destItems =
      source.droppableId === destination.droppableId
        ? sourceItems
        : Array.from(destColumn.tasks);

    // Remove the task from the source column
    const [removed] = sourceItems.splice(source.index, 1);

    // Insert the task into the destination column
    destItems.splice(destination.index, 0, removed);

    // Update the columns state
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        tasks: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        tasks: destItems,
      },
    });
  };

  const handleAddTask = (columnId) => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
    };

    const column = columns[columnId];
    const updatedTasks = [...column.tasks, newTask];

    setColumns({
      ...columns,
      [columnId]: {
        ...column,
        tasks: updatedTasks,
      },
    });

    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setShowAddTaskModal(false);
  };

  const handleAddState = (e) => {
    e.preventDefault();
    if (!newStateName.trim()) return;

    const stateId = newStateName.toLowerCase().replace(/\s+/g, "-");

    setColumns({
      ...columns,
      [stateId]: {
        id: stateId,
        title: newStateName,
        color: newStateColor,
        tasks: [],
      },
    });

    setNewStateName("");
    setNewStateColor("bg-gray-100");
    setShowAddStateModal(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/boards/${boardData.boardRequest.id}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newUserEmail,
            role: newUserRole,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      setNewUserEmail("");
      setNewUserRole("member");
      setShowAddUserModal(false);
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold">Error loading board</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-center">
          <p className="text-xl font-bold">No board data available</p>
          <p>Please sign in to view the board</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Task
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto pb-4">
          <div className="flex gap-8">
            {Object.values(columns).map((column) => (
              <div
                key={column.id}
                className="bg-white rounded-lg shadow-sm w-80 flex-shrink-0"
              >
                <div className={`p-4 rounded-t-lg ${column.color}`}>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {column.title}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {column.tasks.length}{" "}
                    {column.tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <StrictModeDroppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[calc(100vh-16rem)] ${
                        snapshot.isDraggingOver ? "bg-indigo-50" : ""
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging
                                  ? provided.draggableProps.style?.transform
                                  : "none",
                              }}
                              className={`bg-white rounded-lg shadow-sm mb-3 border border-gray-100 hover:border-indigo-500 transition-colors cursor-move ${
                                snapshot.isDragging
                                  ? "shadow-lg ring-2 ring-indigo-500 ring-opacity-50"
                                  : ""
                              }`}
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium text-gray-900">
                                    {task.title}
                                  </h3>
                                  <span
                                    className={`inline-block w-2.5 h-2.5 rounded-full ${getPriorityColor(
                                      task.priority
                                    )}`}
                                  />
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </div>
            ))}

            {/* Add new state button */}
            <button
              onClick={() => setShowAddStateModal(true)}
              className="h-[116px] w-80 flex-shrink-0 bg-white/60 hover:bg-white/80 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="ml-2">Add another list</span>
            </button>
          </div>
        </div>
      </DragDropContext>

      {/* Add State Modal */}
      {showAddStateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New State</h2>
              <button
                onClick={() => setShowAddStateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddState}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State Name
                </label>
                <input
                  type="text"
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select
                  value={newStateColor}
                  onChange={(e) => setNewStateColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="bg-gray-100">Gray</option>
                  <option value="bg-blue-100">Blue</option>
                  <option value="bg-green-100">Green</option>
                  <option value="bg-yellow-100">Yellow</option>
                  <option value="bg-purple-100">Purple</option>
                  <option value="bg-pink-100">Pink</option>
                  <option value="bg-orange-100">Orange</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                >
                  Add State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTask("todo");
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
