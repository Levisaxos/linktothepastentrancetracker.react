
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import NotesModal from './NotesModal';

const NotesPanel = ({ currentGame, onUpdateNotes, isReadOnly = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const notes = currentGame?.globalNotes || [];

  const handleAddNote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      onUpdateNotes(updatedNotes);
    }
  };

  const handleSaveNote = (title, content) => {
    let updatedNotes;
    
    if (editingNote) {
      // Edit existing note
      updatedNotes = notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, title, content, lastModified: new Date().toISOString() }
          : note
      );
    } else {
      // Add new note
      const newNote = {
        id: Date.now(),
        title,
        content,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      updatedNotes = [...notes, newNote];
    }
    
    onUpdateNotes(updatedNotes);
    setShowNoteModal(false);
    setEditingNote(null);
  };

  const handleCloseModal = () => {
    setShowNoteModal(false);
    setEditingNote(null);
  };

  if (!currentGame) return null;

  return (
    <>
      {/* Notes Panel */}
      <div className={`fixed bottom-0 right-4 bg-gray-800 border border-gray-700 rounded-t-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80 h-96' : 'w-auto h-auto'
      }`}>
        
        {/* Collapsed State - Clickable Button */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-t-lg transition-colors"
            title="Open notes panel"
          >
            <ChevronUp size={16} />
            <span className="text-sm font-medium">Notes</span>
            {notes.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {notes.length}
              </span>
            )}
          </button>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="w-80 h-96 flex flex-col">
            {/* Header with separate close button and add button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white">Game Notes</h4>
                {notes.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {notes.length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!isReadOnly && (
                  <button
                    onClick={handleAddNote}
                    className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    title="Add new note"
                  >
                    <Plus size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Collapse notes"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Notes Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notes.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-8">
                  No notes yet. {!isReadOnly && 'Click + to add your first note!'}
                </div>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className="bg-gray-700 border border-gray-600 rounded p-2 group hover:border-gray-500 transition-colors"
                    title={note.content}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-white text-sm truncate">
                          {note.title}
                        </h5>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(note.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      {!isReadOnly && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit note"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <NotesModal
          editingNote={editingNote}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
        />
      )}
    </>
  );
};

export default NotesPanel;