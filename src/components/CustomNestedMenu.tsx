import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Simple icon components
const ExpandMoreIcon = ({ sx }: any) => <span style={{ fontSize: '16px' }}>▼</span>;
const ChevronRightIcon = ({ sx }: any) => <span style={{ fontSize: '16px' }}>▶</span>;

interface NestedMenuItem {
  id: string;
  label: string;
  color?: string;
  fontWeight?: string | number;
  fontSize?: string;
  indentLevel: number;
  children?: NestedMenuItem[];
  onClick?: () => void;
  isExpandable?: boolean;
}

interface CustomNestedMenuProps {
  items: NestedMenuItem[];
  onActionComplete?: () => void;
}

const CustomNestedMenu: React.FC<CustomNestedMenuProps> = ({ items, onActionComplete }) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  }, []);

  const handleItemClick = useCallback((item: NestedMenuItem, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpanded(item.id);
    } else if (item.onClick) {
      item.onClick();
      setExpandedItems(new Set());
      onActionComplete?.();
    }
  }, [toggleExpanded, onActionComplete]);

  const baseStyles = useMemo(() => ({
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      py: 0.5,
      cursor: 'pointer',
      '&:hover': {
        bgcolor: theme.palette.action.hover
      }
    },
    iconButton: {
      p: 0,
      mr: 0.5,
      width: 20,
      height: 20
    },
    spacer: {
      width: 20,
      mr: 0.5
    },
    icon: {
      fontSize: 16
    }
  }), [theme.palette.action.hover]);

  const renderMenuItem = useCallback((item: NestedMenuItem) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const baseIndent = item.indentLevel * 24;

    return (
      <Box key={item.id}>
        <Box
          sx={{
            ...baseStyles.menuItem,
            pl: `${baseIndent}px`
          }}
          onClick={() => handleItemClick(item, hasChildren)}
        >
          {hasChildren ? (
            <IconButton size="small" sx={baseStyles.iconButton}>
              {isExpanded ? (
                <ExpandMoreIcon sx={baseStyles.icon} />
              ) : (
                <ChevronRightIcon sx={baseStyles.icon} />
              )}
            </IconButton>
          ) : (
            <Box sx={baseStyles.spacer} />
          )}
          
          <Typography
            variant="body2"
            sx={{
              color: item.color || 'text.primary',
              fontWeight: item.fontWeight || 'normal',
              fontSize: item.fontSize || '0.875rem'
            }}
          >
            {item.label}
          </Typography>
        </Box>

        {hasChildren && (
          <Collapse in={isExpanded} timeout={200}>
            <Box>
              {item.children!.map(child => renderMenuItem(child))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }, [expandedItems, baseStyles, handleItemClick]);

  return (
    <Box>
      {items.map(item => renderMenuItem(item))}
    </Box>
  );
};

export default CustomNestedMenu;