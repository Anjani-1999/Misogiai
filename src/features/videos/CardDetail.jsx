import { useState } from "react";
import Select from "react-select";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CardDetail({ card, allCards, onDependenciesChange }) {
  const [dependencies, setDependencies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddDependencies = async (selectedOptions) => {
    const newDependencies = selectedOptions.map((option) => ({
      id: option.value,
      title: option.label,
      description: option.description,
    }));

    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedDependencies = [...dependencies, ...newDependencies];
    setDependencies(updatedDependencies);
    onDependenciesChange(updatedDependencies);
    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleRemoveDependency = async (dependencyId) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedDependencies = dependencies.filter(
      (dep) => dep.id !== dependencyId
    );
    setDependencies(updatedDependencies);
    onDependenciesChange(updatedDependencies);
    setIsSaving(false);
  };

  const options = allCards
    .filter((c) => c.id !== card.id && !dependencies.some((d) => d.id === c.id))
    .map((card) => ({
      value: card.id,
      label: card.title,
      description: card.description,
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{card.title}</h2>
      <p className="text-gray-600 mb-6">{card.description}</p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Dependencies</h3>
        {dependencies.length === 0 ? (
          <p className="text-gray-500 italic">No dependencies added yet</p>
        ) : (
          <ul className="space-y-2">
            {dependencies.map((dependency) => (
              <li
                key={dependency.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <span>{dependency.title}</span>
                <button
                  onClick={() => handleRemoveDependency(dependency.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  disabled={isSaving}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        disabled={isSaving}
      >
        Add Dependency
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Dependencies</h3>
            <Select
              isMulti
              options={options}
              onChange={handleAddDependencies}
              className="mb-4"
              placeholder="Search for cards..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
