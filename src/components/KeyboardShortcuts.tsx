import React, { useEffect, useState } from 'react';
import { X, Command } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'ticket' | 'communication' | 'system';
  modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt';
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose,
  shortcuts
}) => {
  const [activeShortcuts, setActiveShortcuts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = [];
      
      if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');
      
      const shortcutKey = [...modifiers, key].join('+');
      setActiveShortcuts(prev => new Set([...prev, shortcutKey]));
      
      // Find and execute matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const shortcutKeyCombo = [
          shortcut.modifier === 'ctrl' ? 'ctrl' : '',
          shortcut.modifier === 'shift' ? 'shift' : '',
          shortcut.modifier === 'alt' ? 'alt' : '',
          shortcut.key.toLowerCase()
        ].filter(Boolean).join('+');
        
        return shortcutKeyCombo === shortcutKey;
      });
      
      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = [];
      
      if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');
      
      const shortcutKey = [...modifiers, key].join('+');
      setActiveShortcuts(prev => {
        const newSet = new Set(prev);
        newSet.delete(shortcutKey);
        return newSet;
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, shortcuts]);

  const getModifierIcon = (modifier?: string) => {
    switch (modifier) {
      case 'ctrl':
        return <Command className="h-3 w-3" />;
      case 'cmd':
        return <Command className="h-3 w-3" />;
      case 'shift':
        return <Command className="h-3 w-3" />;
      case 'alt':
        return <Command className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getModifierText = (modifier?: string) => {
    switch (modifier) {
      case 'ctrl':
        return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
      case 'shift':
        return 'Shift';
      case 'alt':
        return 'Alt';
      default:
        return '';
    }
  };

  const categories = [
    { id: 'navigation', label: 'Navigation', icon: '🏠' },
    { id: 'ticket', label: 'Ticket Actions', icon: '🎫' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'system', label: 'System', icon: '⚙️' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <Command className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to common actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map(category => {
              const categoryShortcuts = shortcuts.filter(s => s.category === category.id);
              if (categoryShortcuts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.label}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {categoryShortcuts.map((shortcut, index) => {
                      const shortcutKey = [
                        shortcut.modifier ? getModifierText(shortcut.modifier) : '',
                        shortcut.key.toUpperCase()
                      ].filter(Boolean).join(' + ');
                      
                      const isActive = activeShortcuts.has([
                        shortcut.modifier || '',
                        shortcut.key.toLowerCase()
                      ].filter(Boolean).join('+'));

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <kbd className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600'
                              : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500'
                          }`}>
                            {shortcutKey}
                          </kbd>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use these shortcuts to navigate faster and be more productive</li>
              <li>• Shortcuts work globally when the helpdesk is focused</li>
              <li>• You can customize shortcuts in your settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing shortcuts
export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const toggleShortcuts = () => setIsShortcutsOpen(!isShortcutsOpen);

  return {
    isShortcutsOpen,
    toggleShortcuts,
    shortcuts
  };
}; 