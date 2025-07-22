import { useState } from 'react';
import { InlineThoughtComposer } from './InlineThoughtComposer';
import { ModalThoughtComposer } from './ModalThoughtComposer';

interface EnhancedThoughtComposerProps {
  onThoughtPosted: () => void;
  parentId?: string;
  placeholder?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const EnhancedThoughtComposer = ({ onThoughtPosted, parentId, placeholder = "What's on your mind?", isOpen, onClose }: EnhancedThoughtComposerProps) => {
  // Only use internal state if not controlled externally
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  const handleOpen = () => typeof isOpen === 'boolean' ? onClose && onClose() : setInternalOpen(true);
  const handleClose = () => typeof isOpen === 'boolean' ? onClose && onClose() : setInternalOpen(false);

  if (parentId) {
    return (
      <ModalThoughtComposer
        isOpen={true}
        onClose={onThoughtPosted}
        onThoughtPosted={onThoughtPosted}
        parentId={parentId}
        placeholder={placeholder}
      />
    );
  }

  const handleThoughtPosted = () => {
    handleClose();
    onThoughtPosted();
  };

  // If isOpen/onClose are provided, render only the modal (for mobile)
  if (typeof isOpen === 'boolean' && onClose) {
    return (
      <ModalThoughtComposer
        isOpen={modalOpen}
        onClose={handleClose}
        onThoughtPosted={handleThoughtPosted}
        placeholder={placeholder}
      />
    );
  }

  // Otherwise, render the inline composer and modal for desktop
  return (
    <>
      <InlineThoughtComposer onOpenModal={handleOpen} />
      <ModalThoughtComposer
        isOpen={modalOpen}
        onClose={handleClose}
        onThoughtPosted={handleThoughtPosted}
        placeholder={placeholder}
      />
    </>
  );
};
