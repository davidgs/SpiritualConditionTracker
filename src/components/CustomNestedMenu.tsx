import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
}

const CustomNestedMenu: React.FC<CustomNestedMenuProps> = ({ items }) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (item: NestedMenuItem) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const baseIndent = item.indentLevel * 24; // 24px per level

    return (
      <Box key={item.id}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            pl: `${baseIndent}px`,
            cursor: hasChildren || item.onClick ? 'pointer' : 'default',
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.onClick) {
              item.onClick();
            }
          }}
        >
          {hasChildren && (
            <IconButton
              size="small"
              sx={{ p: 0, mr: 0.5, width: 20, height: 20 }}
            >
              {isExpanded ? (
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          )}
          
          {!hasChildren && (
            <Box sx={{ width: 20, mr: 0.5 }} /> // Spacer for alignment
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
          <Collapse in={isExpanded}>
            <Box>
              {item.children!.map(child => renderMenuItem(child))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {items.map(item => renderMenuItem(item))}
    </Box>
  );
};

export default CustomNestedMenu;