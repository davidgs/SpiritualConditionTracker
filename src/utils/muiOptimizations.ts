/**
 * MUI Optimization Utilities
 * This file helps reduce bundle size by providing optimized MUI imports
 */

// Re-export commonly used MUI components with tree-shaking optimization
export { 
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  CircularProgress
} from '@mui/material';

export {
  useTheme,
  createTheme,
  ThemeProvider
} from '@mui/material/styles';

export {
  CssBaseline
} from '@mui/material';

// Re-export date picker components
export {
  DatePicker,
  TimePicker
} from '@mui/x-date-pickers';

// Re-export icons that are commonly used
export {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';