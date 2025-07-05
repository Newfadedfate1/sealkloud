import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AccessibilityContextType {
  // Focus management
  focusElement: (elementId: string) => void;
  trapFocus: (containerRef: React.RefObject<HTMLElement>) => void;
  releaseFocus: () => void;
  
  // Screen reader announcements
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Keyboard navigation
  handleKeyboardNavigation: (event: KeyboardEvent) => void;
  
  // Accessibility preferences
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  
  // Skip links
  addSkipLink: (id: string, label: string, target: string) => void;
  removeSkipLink: (id: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface SkipLink {
  id: string;
  label: string;
  target: string;
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [skipLinks, setSkipLinks] = useState<SkipLink[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  const focusTrapRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Load accessibility preferences from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-highContrast') === 'true';
    const savedReducedMotion = localStorage.getItem('accessibility-reducedMotion') === 'true';
    const savedFontSize = localStorage.getItem('accessibility-fontSize') as 'small' | 'medium' | 'large' || 'medium';
    
    setHighContrast(savedHighContrast);
    setReducedMotion(savedReducedMotion);
    setFontSizeState(savedFontSize);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-highContrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('accessibility-reducedMotion', reducedMotion.toString());
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('accessibility-fontSize', fontSize);
  }, [fontSize]);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${fontSize}`);
  }, [highContrast, reducedMotion, fontSize]);

  // Focus management
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  };

  const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;
    
    previousFocusRef.current = document.activeElement as HTMLElement;
    focusTrapRef.current = containerRef.current;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  };

  const releaseFocus = () => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
    focusTrapRef.current = null;
  };

  // Screen reader announcements
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcementId = `sr-announcement-${Date.now()}`;
    const announcement = document.createElement('div');
    announcement.id = announcementId;
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      const element = document.getElementById(announcementId);
      if (element) {
        element.remove();
      }
    }, 1000);
  };

  // Keyboard navigation handler
  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (event.key === 'Tab' && focusTrapRef.current) {
      const focusableElements = focusTrapRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Toggle functions
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
    announceToScreenReader(`High contrast ${!highContrast ? 'enabled' : 'disabled'}`);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
    announceToScreenReader(`Reduced motion ${!reducedMotion ? 'enabled' : 'disabled'}`);
  };

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    announceToScreenReader(`Font size set to ${size}`);
  };

  // Skip link management
  const addSkipLink = (id: string, label: string, target: string) => {
    setSkipLinks(prev => [...prev.filter(link => link.id !== id), { id, label, target }]);
  };

  const removeSkipLink = (id: string) => {
    setSkipLinks(prev => prev.filter(link => link.id !== id));
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, []);

  const value: AccessibilityContextType = {
    focusElement,
    trapFocus,
    releaseFocus,
    announceToScreenReader,
    handleKeyboardNavigation,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    addSkipLink,
    removeSkipLink,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip Links */}
      <div className="skip-links" role="navigation" aria-label="Skip navigation">
        {skipLinks.map(link => (
          <a
            key={link.id}
            href={link.target}
            className="skip-link"
            onClick={(e) => {
              e.preventDefault();
              const target = document.querySelector(link.target);
              if (target) {
                (target as HTMLElement).focus();
                announceToScreenReader(`Skipped to ${link.label}`);
              }
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
      
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}; 