import { useState, useEffect, useCallback } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, 
    Typography, TextField, Chip, InputAdornment, 
    CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar 
} from '@mui/material';
import { User, Calendar, Clock, ChevronRight, ChevronLeft, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { schedulingApi } from '../services/schedulingApi';

/**
 * BookAppointmentDialog — Premium 3-step appointment booking wizard for patients.
 * Steps:
 *   1. Select Doctor: Search/filter doctors.
 *   2. Select Date & Slot: Select date, fetch published availabilities, generate unoccupied slots.
 *   3. Details & Confirm: Enter reason for booking and review appointment details.
 */
export const BookAppointmentDialog = ({ open, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    
    // Selections
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [reason, setReason] = useState('');

    // Slots states
    const [availabilities, setAvailabilities] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // Status states
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Reset states on open/close
    useEffect(() => {
        let active = true;
        if (open) {
            Promise.resolve().then(() => {
                if (!active) return;
                setStep(1);
                setSelectedDoctor(null);
                setSelectedDate('');
                setSelectedSlot(null);
                setReason('');
                setErrorMsg('');
                
                // Load Doctors
                const fetchDoctors = async () => {
                    setLoadingDoctors(true);
                    try {
                        const data = await schedulingApi.getDoctors();
                        if (active) setDoctors(data);
                    } catch {
                        if (active) setErrorMsg('Failed to load doctor directory.');
                    } finally {
                        if (active) setLoadingDoctors(false);
                    }
                };
                fetchDoctors();
            });
        }
        return () => {
            active = false;
        };
    }, [open]);

    // Format initials for avatar
    const getInitials = (name) => {
        if (!name) return 'D';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Filter doctors
    const filteredDoctors = doctors.filter((doc) => 
        doc.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch slots when doctor or date changes
    const loadSlots = useCallback(async () => {
        if (!selectedDoctor || !selectedDate) return;
        setLoadingSlots(true);
        setErrorMsg('');
        setSelectedSlot(null);
        try {
            // 1. Fetch weekly shift availabilities for this doctor
            const avs = await schedulingApi.getDoctorAvailabilities(selectedDoctor.id);
            setAvailabilities(avs);

            // 2. Fetch existing appointments for this doctor on selected date
            const appts = await schedulingApi.getAppointments({
                doctor_id: selectedDoctor.id,
                date: selectedDate,
                status: 'PENDING,CONFIRMED,COMPLETED'
            });
            setBookedAppointments(appts);
        } catch {
            setErrorMsg('Failed to check availability slots.');
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedDoctor, selectedDate]);

    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (active) loadSlots();
        });
        return () => {
            active = false;
        };
    }, [loadSlots]);

    // Slot generation algorithm
    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (!active) return;
            if (!selectedDate || availabilities.length === 0) {
                setAvailableSlots([]);
                return;
            }

            const dateObj = new Date(selectedDate);
            const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            // Backend day_of_week mapping: 0=Monday, ..., 6=Sunday. 
            // JavaScript mapping: 0=Sunday, 1=Monday, ..., 6=Saturday.
            // Let's translate JS day to match Backend mapping:
            const translatedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            // Find doctor availability for this day of week
            const dayAvs = availabilities.filter(av => av.day_of_week === translatedDay);
            
            const parseTime = (t) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };

            const formatTime = (minutes) => {
                const h = Math.floor(minutes / 60);
                const m = minutes % 60;
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
            };

            const formatLabel = (minutes) => {
                const h = Math.floor(minutes / 60);
                const m = minutes % 60;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const displayHour = h % 12 === 0 ? 12 : h % 12;
                return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
            };

            let slots = [];
            dayAvs.forEach(av => {
                const startMin = parseTime(av.start_time);
                const endMin = parseTime(av.end_time);
                const duration = av.slot_duration || 15;

                for (let time = startMin; time + duration <= endMin; time += duration) {
                    const slotStartStr = formatTime(time);
                    const slotEndStr = formatTime(time + duration);

                    // Check overlap with booked appointments
                    const isBooked = bookedAppointments.some(appt => {
                        if (appt.status === 'CANCELLED') return false;
                        const apptStart = parseTime(appt.start_time);
                        const apptEnd = parseTime(appt.end_time);
                        return (time < apptEnd && (time + duration) > apptStart);
                    });

                    if (!isBooked) {
                        slots.push({
                            start_time: slotStartStr,
                            end_time: slotEndStr,
                            label: `${formatLabel(time)} - ${formatLabel(time + duration)}`
                        });
                    }
                }
            });

            if (active) setAvailableSlots(slots);
        });
        return () => {
            active = false;
        };
    }, [selectedDate, availabilities, bookedAppointments]);

    const handleNext = () => {
        if (step === 1 && selectedDoctor) setStep(2);
        else if (step === 2 && selectedDate && selectedSlot) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleConfirmBooking = async () => {
        setSubmitting(true);
        setErrorMsg('');
        try {
            const appointmentData = {
                doctor: selectedDoctor.id,
                date: selectedDate,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
                reason: reason.trim()
            };
            await schedulingApi.createAppointment(appointmentData);
            onSuccess();
            onClose();
        } catch (err) {
            setErrorMsg(
                err.response?.data?.non_field_errors?.[0] || 
                err.response?.data?.detail || 
                'Failed to confirm your booking. Please choose another slot.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate minimum selectable date (today)
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: '28px', p: 1.5 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    Book Consultation Slot
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                    Step {step} of 3: {step === 1 ? 'Select your medical specialist' : step === 2 ? 'Choose appointment date and time' : 'Confirm reservation details'}
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: '340px' }}>
                {errorMsg && (
                    <Box sx={{ bgcolor: 'rgba(219, 68, 85, 0.05)', p: 1.5, borderRadius: '12px', border: '1px solid rgba(219, 68, 85, 0.15)', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <AlertCircle size={18} style={{ color: '#BA1A1A', flexShrink: 0 }} />
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                            {errorMsg}
                        </Typography>
                    </Box>
                )}

                {/* STEP 1: SELECT DOCTOR */}
                {step === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            placeholder="Search by doctor name or specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} style={{ opacity: 0.5 }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        {loadingDoctors ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : filteredDoctors.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, color: 'text.disabled' }}>
                                <User size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
                                <Typography variant="body2">No medical specialists match your search.</Typography>
                            </Box>
                        ) : (
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '300px', overflowY: 'auto', p: 0 }}>
                                {filteredDoctors.map((doc) => {
                                    const isSelected = selectedDoctor?.id === doc.id;
                                    return (
                                        <ListItem
                                            button
                                            key={doc.id}
                                            onClick={() => setSelectedDoctor(doc)}
                                            sx={{
                                                borderRadius: '16px',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'primary.main' : 'divider',
                                                bgcolor: isSelected ? 'rgba(0, 106, 106, 0.03)' : 'transparent',
                                                transition: 'all 0.2s',
                                                py: 1.5,
                                                '&:hover': {
                                                    bgcolor: isSelected ? 'rgba(0, 106, 106, 0.05)' : 'action.hover'
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: isSelected ? 'primary.main' : 'rgba(0, 106, 106, 0.08)',
                                                        color: isSelected ? 'white' : 'primary.main',
                                                        fontWeight: 700,
                                                        fontFamily: "'Outfit', sans-serif"
                                                    }}
                                                >
                                                    {getInitials(doc.user.full_name)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'Outfit', sans-serif" }}>
                                                        Dr. {doc.user.full_name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                        <Chip label={doc.specialization} size="small" sx={{ fontSize: '11px', height: '20px', fontWeight: 600 }} />
                                                        <Chip label={`Fee: Rs. ${parseFloat(doc.consultation_fee).toLocaleString()}`} size="small" variant="outlined" sx={{ fontSize: '11px', height: '20px', fontWeight: 600 }} />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                )}

                {/* STEP 2: SELECT DATE & TIME SLOT */}
                {step === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Doctor Quick Badge */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                            <Avatar sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700 }}>
                                {getInitials(selectedDoctor?.user.full_name)}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'Outfit', sans-serif" }}>
                                    Dr. {selectedDoctor?.user.full_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {selectedDoctor?.specialization} • Consultation Fee: Rs. {parseFloat(selectedDoctor?.consultation_fee).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Date Field */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: 'text.secondary', fontFamily: "'Outfit', sans-serif" }}>
                                Appointment Date <span style={{ color: '#F87171' }}>*</span>
                            </Typography>
                            <TextField
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                inputProps={{ min: todayStr }}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Calendar size={18} style={{ opacity: 0.5 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Time Slot Picker */}
                        {selectedDate && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.secondary', fontFamily: "'Outfit', sans-serif" }}>
                                    Select Consult Slot <span style={{ color: '#F87171' }}>*</span>
                                </Typography>

                                {loadingSlots ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={25} />
                                    </Box>
                                ) : availableSlots.length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, color: 'text.disabled', bgcolor: 'rgba(0,0,0,0.01)', borderRadius: '16px', border: '1px dashed', borderColor: 'divider' }}>
                                        <Clock size={30} style={{ opacity: 0.3, marginBottom: 8 }} />
                                        <Typography variant="body2">No available consultation slots on this date.</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5 }}>Try selecting another date.</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, maxHeight: '180px', overflowY: 'auto', p: 0.5 }}>
                                        {availableSlots.map((slot, idx) => {
                                            const isSelected = selectedSlot?.start_time === slot.start_time;
                                            return (
                                                <Chip
                                                    key={idx}
                                                    label={slot.label}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    color={isSelected ? 'primary' : 'default'}
                                                    variant={isSelected ? 'filled' : 'outlined'}
                                                    sx={{
                                                        py: 2,
                                                        px: 1,
                                                        borderRadius: '100px',
                                                        fontWeight: 600,
                                                        fontSize: '12.5px',
                                                        borderColor: 'divider',
                                                        '&:hover': {
                                                            bgcolor: isSelected ? 'primary.dark' : 'action.hover'
                                                        }
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                )}

                {/* STEP 3: DETAILS & CONFIRM */}
                {step === 3 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                        {/* Summary Card */}
                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '20px', bgcolor: 'action.hover', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle2 size={16} /> Consultation Review
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Specialist Clinician</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Dr. {selectedDoctor?.user.full_name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Specialization</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedDoctor?.specialization}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Consultation Date</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Reserved Time Slot</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedSlot?.label}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Consultation Fee</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                        Rs. {parseFloat(selectedDoctor?.consultation_fee).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Symptoms reason */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Typography component="label" sx={{ fontSize: '13px', fontWeight: 600, color: 'text.secondary', fontFamily: "'Outfit', sans-serif" }}>
                                Medical Condition / Symptoms <span style={{ color: '#F87171' }}>*</span>
                            </Typography>
                            <TextField
                                multiline
                                rows={3}
                                placeholder="Describe your symptoms, reason for consultation, or current health issues..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                fullWidth
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1.5 }}>
                <Button 
                    onClick={onClose} 
                    variant="text"
                    disabled={submitting}
                    sx={{ color: 'text.secondary', fontWeight: 600, borderRadius: '100px', textTransform: 'none', px: 3, minHeight: '40px' }}
                >
                    Cancel
                </Button>

                <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
                    {step > 1 && (
                        <Button
                            variant="outlined"
                            startIcon={<ChevronLeft size={16} />}
                            onClick={handleBack}
                            disabled={submitting}
                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3, minHeight: '40px' }}
                        >
                            Back
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button
                            variant="contained"
                            endIcon={<ChevronRight size={16} />}
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !selectedDoctor) || 
                                (step === 2 && (!selectedDate || !selectedSlot))
                            }
                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3, minHeight: '40px', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)' }}
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleConfirmBooking}
                            disabled={submitting || !reason.trim()}
                            sx={{ 
                                borderRadius: '100px', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                px: 4, 
                                minHeight: '40px',
                                background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                position: 'relative'
                            }}
                        >
                            {submitting ? (
                                <CircularProgress size={20} sx={{ color: 'white' }} />
                            ) : (
                                'Confirm & Book'
                            )}
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};
