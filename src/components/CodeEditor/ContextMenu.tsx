import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ContextMenuItem =
  | {
      id: string;
      separator: true;
    }
  | {
      id: string;
      label: string;
      icon?: React.ReactNode;
      shortcut?: string;
      action: () => void | Promise<void>;
      disabled?: boolean;
      separator?: false;
      submenu?: ContextMenuItem[];
      danger?: boolean;
    };

export interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

/**
 * ContextMenu - Right-click context menu component
 * 
 * @example
 * <ContextMenu
 *   items={[
 *     { id: 'new', label: 'New File', icon: <FileIcon />, action: createFile },
 *     { id: 'sep1', separator: true },
 *     { id: 'delete', label: 'Delete', icon: <TrashIcon />, action: deleteFile, danger: true }
 *   ]}
 *   position={{ x: 100, y: 200 }}
 *   onClose={() => setShowMenu(false)}
 * />
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
  className
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position
    if (rect.right > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (rect.bottom > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [position]);

  const handleItemClick = async (item: ContextMenuItem) => {
    if ('separator' in item && item.separator) return;
    if (item.disabled) return;

    try {
      await item.action();
    } catch (err) {
      console.error('Context menu action failed:', err);
    } finally {
      onClose();
    }
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "fixed z-[9999] min-w-[200px]",
        "bg-[#252526] border border-[#454545] rounded-md shadow-xl",
        "py-1",
        className
      )}
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {items.map((item) => {
        if ('separator' in item && item.separator) {
          return (
            <div
              key={item.id}
              className="h-px bg-[#454545] my-1 mx-2"
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              "w-full px-3 py-1.5 text-left text-sm",
              "flex items-center gap-2",
              "transition-colors duration-150",
              "text-[#cccccc]",
              !item.disabled && "hover:bg-[#2a2d2e]",
              item.disabled && "opacity-50 cursor-not-allowed",
              item.danger && !item.disabled && "text-red-400 hover:bg-red-900/20"
            )}
          >
            {/* Icon */}
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span className="flex-1 truncate">{item.label}</span>

            {/* Shortcut */}
            {item.shortcut && (
              <span className="text-xs text-[#888] ml-4 flex-shrink-0">
                {item.shortcut}
              </span>
            )}

            {/* Submenu indicator */}
            {item.submenu && (
              <span className="text-[#888] flex-shrink-0">›</span>
            )}
          </button>
        );
      })}
    </motion.div>
  );
};

/**
 * ContextMenuProvider - Wrapper component to handle context menu state
 */
interface ContextMenuProviderProps {
  children: (props: {
    showContextMenu: (e: React.MouseEvent, items: ContextMenuItem[]) => void;
  }) => React.ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children
}) => {
  const [contextMenu, setContextMenu] = React.useState<{
    position: { x: number; y: number };
    items: ContextMenuItem[];
  } | null>(null);

  const showContextMenu = (e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items
    });
  };

  return (
    <>
      {children({ showContextMenu })}
      
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            items={contextMenu.items}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

