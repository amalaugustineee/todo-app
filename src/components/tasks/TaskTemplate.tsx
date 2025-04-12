import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Task, Priority, Category } from '../../types/task';
import { useFirestoreTasks } from '../../hooks/useFirestoreTasks';
import { useAuth } from '../../contexts/AuthContext';

// Define the structure of a task template
interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  category: Category;
  estimatedDuration?: number; // in minutes
  steps?: string[];
  createdAt: string;
  createdBy: string;
}

interface TaskTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: TaskTemplate) => void;
}

export default function TaskTemplateModal({ isOpen, onClose, onTemplateSelect }: TaskTemplateProps) {
  const { currentUser } = useAuth();
  const { addTask } = useFirestoreTasks();
  
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    name: '',
    description: '',
    priority: 'medium',
    category: 'work',
    steps: ['']
  });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('taskTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Error loading templates:', error);
        // If there's an error, initialize with empty array
        setTemplates([]);
      }
    }
  }, []);
  
  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('taskTemplates', JSON.stringify(templates));
    }
  }, [templates]);
  
  const handleAddTemplate = () => {
    if (!newTemplate.name) return;
    if (!currentUser) return;
    
    const templateId = `template_${Date.now()}`;
    const template: TaskTemplate = {
      id: templateId,
      name: newTemplate.name || '',  // Fix for linter error: ensure name is not undefined
      description: newTemplate.description || '',
      priority: newTemplate.priority || 'medium',
      category: newTemplate.category || 'work',
      estimatedDuration: newTemplate.estimatedDuration,
      steps: newTemplate.steps?.filter(step => step.trim() !== '') || [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid
    };
    
    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      description: '',
      priority: 'medium',
      category: 'work',
      steps: ['']
    });
    setIsAddingTemplate(false);
  };
  
  const handleEditTemplate = () => {
    if (!newTemplate.name || !editingTemplateId) return;
    
    const updatedTemplates = templates.map(template => 
      template.id === editingTemplateId 
        ? { 
            ...template, 
            name: newTemplate.name,
            description: newTemplate.description || '',
            priority: newTemplate.priority || 'medium',
            category: newTemplate.category || 'work',
            estimatedDuration: newTemplate.estimatedDuration,
            steps: newTemplate.steps?.filter(step => step.trim() !== '') || []
          } 
        : template
    );
    
    setTemplates(updatedTemplates);
    setNewTemplate({
      name: '',
      description: '',
      priority: 'medium',
      category: 'work',
      steps: ['']
    });
    setIsEditingTemplate(false);
    setEditingTemplateId(null);
  };
  
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };
  
  const startEditTemplate = (template: TaskTemplate) => {
    setNewTemplate({
      name: template.name,
      description: template.description || '',
      priority: template.priority,
      category: template.category,
      estimatedDuration: template.estimatedDuration,
      steps: template.steps && template.steps.length > 0 ? template.steps : ['']
    });
    setEditingTemplateId(template.id);
    setIsEditingTemplate(true);
  };
  
  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...(newTemplate.steps || [])];
    updatedSteps[index] = value;
    setNewTemplate({ ...newTemplate, steps: updatedSteps });
  };
  
  const addStep = () => {
    setNewTemplate({ 
      ...newTemplate, 
      steps: [...(newTemplate.steps || []), ''] 
    });
  };
  
  const removeStep = (index: number) => {
    const updatedSteps = [...(newTemplate.steps || [])];
    updatedSteps.splice(index, 1);
    setNewTemplate({ ...newTemplate, steps: updatedSteps });
  };
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const useTemplate = (template: TaskTemplate) => {
    onTemplateSelect(template);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  Task Templates
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                
                {/* Search and Add buttons */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  <button
                    onClick={() => setIsAddingTemplate(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    New
                  </button>
                </div>
                
                {/* Templates list */}
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchQuery 
                        ? "No templates match your search" 
                        : "No templates yet. Create your first template!"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTemplates.map(template => (
                        <div 
                          key={template.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 dark:text-gray-200">{template.name}</h4>
                              {template.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {template.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                  {template.category}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                  {template.priority}
                                </span>
                                {template.estimatedDuration && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    {template.estimatedDuration} min
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => useTemplate(template)}
                                className="p-1.5 text-primary-500 hover:text-primary-700 dark:hover:text-primary-300"
                                title="Use template"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => startEditTemplate(template)}
                                className="p-1.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                                title="Edit template"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                                title="Delete template"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add/Edit Template Form */}
                {(isAddingTemplate || isEditingTemplate) && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {isEditingTemplate ? 'Edit Template' : 'New Template'}
                    </h4>
                    <div className="mt-3 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Template Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newTemplate.description || ''}
                          onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Priority
                          </label>
                          <select
                            value={newTemplate.priority || 'medium'}
                            onChange={(e) => setNewTemplate({ ...newTemplate, priority: e.target.value as Priority })}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <select
                            value={newTemplate.category || 'work'}
                            onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as Category })}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          >
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="shopping">Shopping</option>
                            <option value="health">Health</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Estimated Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTemplate.estimatedDuration || ''}
                          onChange={(e) => setNewTemplate({ ...newTemplate, estimatedDuration: parseInt(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Steps
                          </label>
                          <button
                            type="button"
                            onClick={addStep}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          >
                            + Add Step
                          </button>
                        </div>
                        {newTemplate.steps && newTemplate.steps.map((step, index) => (
                          <div key={index} className="flex mt-2">
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => handleStepChange(index, e.target.value)}
                              placeholder={`Step ${index + 1}`}
                              className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              disabled={newTemplate.steps?.length === 1}
                              className="rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingTemplate(false);
                            setIsEditingTemplate(false);
                            setNewTemplate({
                              name: '',
                              description: '',
                              priority: 'medium',
                              category: 'work',
                              steps: ['']
                            });
                          }}
                          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={isEditingTemplate ? handleEditTemplate : handleAddTemplate}
                          disabled={!newTemplate.name}
                          className="px-4 py-2 text-sm rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEditingTemplate ? 'Update Template' : 'Save Template'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isAddingTemplate && !isEditingTemplate && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 