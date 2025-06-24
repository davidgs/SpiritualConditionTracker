import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';

interface UnifiedPersonFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  title: string;
}

export default function UnifiedPersonForm({
  initialData,
  onSave,
  onCancel,
  title
}: UnifiedPersonFormProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    sobrietyDate: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      let formattedData = { ...initialData };
      if (formattedData.sobrietyDate) {
        formattedData.sobrietyDate = new Date(formattedData.sobrietyDate)
          .toISOString()
          .split('T')[0];
      }
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  const handleSubmit = () => {
    let dataToSave = { ...formData };

    try {
      if (dataToSave.sobrietyDate && dataToSave.sobrietyDate.trim()) {
        const date = new Date(dataToSave.sobrietyDate);
        if (!isNaN(date.getTime())) {
          dataToSave.sobrietyDate = date.toISOString();
        } else {
          dataToSave.sobrietyDate = null;
        }
      } else {
        dataToSave.sobrietyDate = null;
      }
    } catch (error) {
      dataToSave.sobrietyDate = null;
    }

    onSave(dataToSave);
  };

  console.log('UnifiedPersonForm is rendering with title:', title);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: theme.spacing(1),
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <IconButton
          onClick={onCancel}
          sx={{
            mr: theme.spacing(1),
            color: theme.palette.primary.contrastText
          }}
        >
          <i className="fa-solid fa-times"></i>
        </IconButton>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 600,
            fontSize: '18px'
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Form Content */}
      <Box sx={{
        flex: 1,
        p: theme.spacing(2),
        bgcolor: theme.palette.background.default
      }}>
        <Box sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1)
        }}>
          {/* First Name */}
          <TextField
            fullWidth
            placeholder="First Name*"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            size="medium"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: theme.palette.divider
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary
              },
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.7
              }
            }}
          />

          {/* Last Name */}
          <TextField
            fullWidth
            placeholder="Last Name"
            name="lastName"
            size="medium"
            value={formData.lastName}
            onChange={handleChange}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: theme.palette.divider
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary
              },
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.7
              }
            }}
          />

          {/* Phone Number */}
          <MuiTelInput
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            defaultCountry="US"
            forceCallingCode
            fullWidth
            placeholder="Phone Number"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                '& fieldset': {
                  borderColor: theme.palette.divider
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '& input::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 0.7
                }
              }
            }}
          />

          {/* Email */}
          <TextField
            fullWidth
            placeholder="Email"
            name="email"
            type="email"
            size="medium"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: theme.palette.divider
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary
              },
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.7
              }
            }}
          />

          {/* Sobriety Date */}
          <Box sx={{ position: 'relative' }}>
            <Typography sx={{
              color: theme.palette.text.secondary,
              fontSize: '14px',
              mb: theme.spacing(.5),
              ml: theme.spacing(.5)
            }}>
              Sobriety Date
            </Typography>
            <TextField
              fullWidth
              name="sobrietyDate"
              type="date"
              size="medium"
              value={formData.sobrietyDate}
              onChange={handleChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            />
          </Box>

          {/* Notes */}
          <TextField
            fullWidth
            placeholder="Notes"
            name="notes"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: theme.palette.divider
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary
              },
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.7
              }
            }}
          />
        </Box>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{
        p: theme.spacing(2),
        bgcolor: theme.palette.background.default,
        display: 'flex',
        gap: theme.spacing(1),
        justifyContent: 'center'
      }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            flex: 1,
            maxWidth: '140px',
            borderRadius: theme.spacing(1),
            textTransform: 'none',
            fontWeight: 600,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            flex: 1,
            maxWidth: '140px',
            borderRadius: theme.spacing(1),
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          {initialData ? 'Update' : 'Add'}
        </Button>
      </Box>
    </Box>
  );
}