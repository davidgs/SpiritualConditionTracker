import React from 'react';
import { useTheme } from '@mui/material/styles';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface ActionItemProps {
  actionItem: {
    id: string | number;
    title: string;
    notes?: string;
    completed?: boolean | number;
    deleted?: boolean | number;
    createdAt?: string;
    dueDate?: string;
    date?: string;
    // For activity list items that reference action items
    actionItemId?: number;
    actionItemData?: any;
    type?: string;
    sponsorName?: string;
    sponseeName?: string;
  };
  showDate?: boolean;
  onToggleComplete?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  variant?: 'compact' | 'full'; // compact for activities list, full for detail views
  sponsorContacts?: any[];
}

export default function ActionItem({
  actionItem,
  showDate = true,
  onToggleComplete,
  onDelete,
  variant = 'full',
  sponsorContacts = []
}: ActionItemProps) {
  const theme = useTheme();

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't allow completion toggle if item is deleted
    if (isDeleted) {
      console.log('[ActionItem] Cannot complete deleted action item');
      return;
    }
    if (onToggleComplete) {
      // Use actionItemId if this is from the activities list, otherwise use the direct id
      const targetId = actionItem.actionItemId || actionItem.id;
      onToggleComplete(targetId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      // Use actionItemId if this is from the activities list, otherwise use the direct id
      const targetId = actionItem.actionItemId || actionItem.id;
      onDelete(targetId);
    }
  };

  const isDeleted = Boolean(actionItem.deleted || (actionItem.actionItemData && actionItem.actionItemData.deleted));
  const isCompleted = Boolean(actionItem.completed || (actionItem.actionItemData && actionItem.actionItemData.completed));

  const displayDate = actionItem.date || actionItem.dueDate || actionItem.createdAt;

  if (variant === 'compact') {
    // Compact version for activities list
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: '0.5rem',
        marginBottom: '0.25rem',
        padding: '0.25rem',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        backgroundColor: 'transparent'
      }}>
        {/* Icon */}
        <div style={{
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.5rem',
          flexShrink: 0,
          alignSelf: 'flex-start',
          marginTop: '2px'
        }}>
          <i className="fas fa-list-check" style={{
            fontSize: '0.8rem',
            color: theme.palette.warning.main
          }}></i>
        </div>
        
        {/* Content */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.125rem'
          }}>
            <div style={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              fontSize: '1rem',
              lineHeight: '1.2',
              flex: 1,
              minWidth: 0,
              wordWrap: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {(() => {
                // Get clean title
                let title = actionItem.title || 'Action Item';
                
                // Remove "Sponsor Action:" prefix if present
                if (title.startsWith('Sponsor Action:')) {
                  title = title.replace('Sponsor Action:', '').trim();
                }
                
                // Add sponsor attribution for sponsor action items
                if (actionItem.type === 'sponsor_action_item') {
                  if (actionItem.sponsorName) {
                    return `${title} (from ${actionItem.sponsorName})`;
                  } else if (sponsorContacts.length > 0) {
                    const sponsor = sponsorContacts[0];
                    const sponsorName = `${sponsor.name || ''} ${sponsor.lastName || ''}`.trim() || 'Sponsor';
                    return `${title} (from ${sponsorName})`;
                  }
                } else if (actionItem.type === 'sponsee_action_item') {
                  if (actionItem.sponseeName) {
                    return `${title} (for ${actionItem.sponseeName})`;
                  }
                }
                
                return title;
              })()}
            </div>
            
            {showDate && displayDate && (
              <div style={{
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                flexShrink: 0,
                marginLeft: '0.5rem',
                lineHeight: '1.2'
              }}>
                {formatDateForDisplay(displayDate)}
              </div>
            )}
          </div>
          
          <div style={{
            color: isDeleted ? theme.palette.error.main : theme.palette.text.secondary,
            fontSize: '0.875rem',
            lineHeight: '1.3',
            marginTop: '0.125rem',
            wordWrap: 'break-word',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textDecoration: isDeleted ? 'line-through' : 'none',
            opacity: isDeleted ? 0.7 : 1
          }}>
            {actionItem.notes || 'No additional details'}
          </div>
          
          {isCompleted && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.25rem'
            }}>
              <i className="fas fa-check-circle" style={{
                color: theme.palette.success.main,
                fontSize: '0.75rem'
              }}></i>
              <span style={{
                color: theme.palette.success.main,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Completed
              </span>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '0.25rem',
          marginLeft: '0.5rem',
          alignSelf: 'flex-start',
          marginTop: '0.125rem'
        }}>
          {/* Checkbox for completion */}
          <button
            onClick={handleToggleComplete}
            disabled={isDeleted}
            style={{
              background: 'none',
              border: `1.5px solid ${isCompleted ? theme.palette.success.main : theme.palette.text.secondary}`,
              cursor: isDeleted ? 'not-allowed' : 'pointer',
              color: isCompleted ? theme.palette.success.main : theme.palette.text.secondary,
              padding: '0.125rem',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              width: '18px',
              height: '18px',
              backgroundColor: isCompleted ? theme.palette.success.main : 'transparent',
              opacity: isDeleted ? 0.5 : 1,
              flexShrink: 0
            }}
            title={isDeleted ? "Deleted item" : (isCompleted ? "Mark as incomplete" : "Mark as complete")}
          >
            {isCompleted && (
              <i className="fas fa-check" style={{ color: 'white', fontSize: '0.6rem' }}></i>
            )}
          </button>
          
          {/* Delete button */}
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDeleted ? theme.palette.text.secondary : theme.palette.error.main,
              padding: '0.25rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              width: '20px',
              height: '20px',
              flexShrink: 0
            }}
            title={isDeleted ? "Already deleted (-0.5 points)" : "Delete action item (-0.5 points)"}
          >
            <i className={isDeleted ? "fas fa-trash-slash" : "fas fa-times"}></i>
          </button>
        </div>
      </div>
    );
  }

  // Full version for detail views and standalone display
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      backgroundColor: theme.palette.background.default,
      borderRadius: '8px',
      border: `1px solid ${theme.palette.divider}`,
      marginBottom: '0.5rem'
    }}>
      {/* Checkbox for completion */}
      <button
        onClick={handleToggleComplete}
        disabled={isDeleted}
        style={{
          background: 'none',
          border: `2px solid ${isCompleted ? theme.palette.success.main : theme.palette.text.secondary}`,
          cursor: isDeleted ? 'not-allowed' : 'pointer',
          color: isCompleted ? theme.palette.success.main : theme.palette.text.secondary,
          padding: '0.25rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          width: '24px',
          height: '24px',
          backgroundColor: isCompleted ? theme.palette.success.main : 'transparent',
          flexShrink: 0,
          opacity: isDeleted ? 0.5 : 1
        }}
        title={isDeleted ? "Deleted item" : (isCompleted ? "Mark as incomplete" : "Mark as complete")}
      >
        {isCompleted && (
          <i className="fas fa-check" style={{ color: 'white', fontSize: '0.7rem' }}></i>
        )}
      </button>
      
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '1.125rem',
          fontWeight: 500,
          color: isDeleted ? theme.palette.error.main : theme.palette.text.primary,
          textDecoration: isDeleted ? 'line-through' : (isCompleted ? 'line-through' : 'none'),
          opacity: isDeleted ? 0.7 : (isCompleted ? 0.7 : 1),
          wordWrap: 'break-word'
        }}>
          {actionItem.title}
        </div>
        
        {actionItem.notes && (
          <div style={{
            fontSize: '1rem',
            color: theme.palette.text.secondary,
            marginTop: '0.25rem',
            wordWrap: 'break-word'
          }}>
            {actionItem.notes}
          </div>
        )}
        
        {showDate && displayDate && (
          <div style={{
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
            marginTop: '0.25rem'
          }}>
            {formatDateForDisplay(displayDate)}
          </div>
        )}
      </div>
      
      {/* Delete button */}
      <button
        onClick={handleDelete}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: theme.palette.error.main,
          padding: '0.5rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          flexShrink: 0
        }}
        title="Delete action item"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}