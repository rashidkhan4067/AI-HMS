import { useState, useMemo } from 'react';
import { 
    Box, Grid, Typography, Button, IconButton, Paper, Card, CardContent,
    Tooltip, Chip, ToggleButton, ToggleButtonGroup, Collapse, List, ListItem,
    ListItemText, ListItemIcon, Divider, useTheme
} from '@mui/material';
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
    User, FileText, CheckCircle2, AlertCircle, XCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeLabel } from '../../../shared/utils/dateUtils';

/**
 * InteractiveCalendar — Premium, responsive grid-based custom scheduling console.
 * Supports:
 *  - Month and Week view toggles
 *  - Dynamic date calculations & navigation
 *  - Color-coded status representation following the Al Shifaa theme
 *  - Slide transitions for month/week switching
 *  - Interactive day selection with collapsible daily agenda
 */
export const InteractiveCalendar = ({ 
    appointments = [], 
    onAppointmentClick, 
    role = 'PATIENT' 
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // State
    const [view, setView] = useState('month'); // 'month' or 'week'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(
        new Date().toISOString().split('T')[0]
    );

    // Color definitions per appointment status
    const statusConfig = {
        PENDING: { label: 'Pending', color: 'info', bg: 'rgba(13, 110, 253, 0.08)', border: 'rgba(13, 110, 253, 0.2)', text: '#0D6EFD', icon: Clock },
        CONFIRMED: { label: 'Confirmed', color: 'primary', bg: 'rgba(0, 106, 106, 0.08)', border: 'rgba(0, 106, 106, 0.2)', text: '#006A6A', icon: CheckCircle2 },
        CANCELLED: { label: 'Cancelled', color: 'error', bg: 'rgba(186, 26, 26, 0.08)', border: 'rgba(186, 26, 26, 0.2)', text: '#BA1A1A', icon: XCircle },
        COMPLETED: { label: 'Completed', color: 'success', bg: 'rgba(22, 163, 74, 0.08)', border: 'rgba(22, 163, 74, 0.2)', text: '#16A34A', icon: CheckCircle2 }
    };

    // Navigation handlers
    const handlePrev = () => {
        const nextDate = new Date(currentDate);
        if (view === 'month') {
            nextDate.setMonth(currentDate.getMonth() - 1);
        } else {
            nextDate.setDate(currentDate.getDate() - 7);
        }
        setCurrentDate(nextDate);
    };

    const handleNext = () => {
        const nextDate = new Date(currentDate);
        if (view === 'month') {
            nextDate.setMonth(currentDate.getMonth() + 1);
        } else {
            nextDate.setDate(currentDate.getDate() + 7);
        }
        setCurrentDate(nextDate);
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDateStr(today.toISOString().split('T')[0]);
    };

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    // Month details calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Days in current month
    const daysInMonth = useMemo(() => {
        return new Date(year, month + 1, 0).getDate();
    }, [year, month]);

    // Start day of week of current month (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = useMemo(() => {
        return new Date(year, month, 1).getDay();
    }, [year, month]);

    // Pre-calculate month grid days
    const monthDays = useMemo(() => {
        const tempDays = [];
        // Previous month padding days
        const prevMonthYear = month === 0 ? year - 1 : year;
        const prevMonthVal = month === 0 ? 11 : month - 1;
        const daysInPrevMonth = new Date(prevMonthYear, prevMonthVal + 1, 0).getDate();
        
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const dateStr = `${prevMonthYear}-${String(prevMonthVal + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            tempDays.push({ dayNum: d, dateStr, isCurrentMonth: false });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            tempDays.push({ dayNum: d, dateStr, isCurrentMonth: true });
        }

        // Next month padding days to make perfect grid multiple of 7
        const totalGridSlots = 42; // 6 rows of 7
        const nextMonthYear = month === 11 ? year + 1 : year;
        const nextMonthVal = month === 11 ? 0 : month + 1;
        let nextDayCounter = 1;
        
        while (tempDays.length < totalGridSlots) {
            const dateStr = `${nextMonthYear}-${String(nextMonthVal + 1).padStart(2, '0')}-${String(nextDayCounter).padStart(2, '0')}`;
            tempDays.push({ dayNum: nextDayCounter, dateStr, isCurrentMonth: false });
            nextDayCounter++;
        }

        return tempDays;
    }, [year, month, daysInMonth, startDayOfWeek]);

    // Week details calculations
    const weekDays = useMemo(() => {
        const tempDays = [];
        const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday
        const startOfWeek = new Date(currentDate);
        // Start week on Sunday (or Monday, let's choose Sunday = currentDayOfWeek)
        startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const dateStr = dayDate.toISOString().split('T')[0];
            tempDays.push({
                dayNum: dayDate.getDate(),
                dayName: dayDate.toLocaleString('default', { weekday: 'short' }),
                dateStr,
                dateObj: dayDate
            });
        }
        return tempDays;
    }, [currentDate]);

    // Index appointments by date for constant time lookup
    const appointmentsByDate = useMemo(() => {
        const map = {};
        appointments.forEach(appt => {
            const dateStr = appt.date;
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(appt);
        });

        // Sort appointments by start_time
        Object.keys(map).forEach(dateStr => {
            map[dateStr].sort((a, b) => a.start_time.localeCompare(b.start_time));
        });

        return map;
    }, [appointments]);

    // Selected day's appointments for the detailed list
    const selectedDateAppointments = useMemo(() => {
        return appointmentsByDate[selectedDateStr] || [];
    }, [appointmentsByDate, selectedDateStr]);

    const weekDayHeaderName = (day) => {
        return day.toLocaleString('default', { weekday: 'short' });
    };

    const format12Hour = (timeStr) => formatTimeLabel(timeStr, { padHours: false });

    return (
        <Paper 
            elevation={0}
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: '24px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? 'rgba(24, 31, 31, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}
        >
            {/* Calendar Control Header */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2 
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton onClick={handlePrev} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <ChevronLeft size={18} />
                    </IconButton>
                    
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", minWidth: '150px', textAlign: 'center' }}>
                        {view === 'month' ? `${monthName} ${year}` : `Week of ${weekDays[0].dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                    </Typography>

                    <IconButton onClick={handleNext} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <ChevronRight size={18} />
                    </IconButton>
                    
                    <Button 
                        onClick={handleToday} 
                        size="small" 
                        variant="outlined" 
                        sx={{ ml: 1, minHeight: '34px', py: 0.5, borderRadius: '10px' }}
                    >
                        Today
                    </Button>
                </Box>

                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    size="small"
                    sx={{
                        alignSelf: { xs: 'center', sm: 'auto' },
                        bgcolor: 'action.hover',
                        p: 0.5,
                        borderRadius: '12px',
                        '& .MuiToggleButton-root': {
                            border: 'none',
                            borderRadius: '8px',
                            px: 2,
                            py: 0.5,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            '&.Mui-selected': {
                                bgcolor: 'background.paper',
                                color: 'primary.main',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }
                        }
                    }}
                >
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="week">Week</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Calendar Views Grid */}
            <Box sx={{ minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {view === 'month' ? (
                        <motion.div
                            key="month-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Month Weekday Header */}
                            <Grid container columns={7} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 1, textAlign: 'center' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                                    <Grid item xs={1} key={dayName}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                            {dayName}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Month Grid Cells */}
                            <Grid container columns={7} spacing={1} sx={{ rowGap: 1 }}>
                                {monthDays.map((cell, idx) => {
                                    const appts = appointmentsByDate[cell.dateStr] || [];
                                    const isSelected = selectedDateStr === cell.dateStr;
                                    const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;

                                    return (
                                        <Grid item xs={1} key={`${cell.dateStr}-${idx}`}>
                                            <Paper
                                                onClick={() => setSelectedDateStr(cell.dateStr)}
                                                sx={{
                                                    height: { xs: '75px', md: '105px' },
                                                    p: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.5,
                                                    cursor: 'pointer',
                                                    borderRadius: '16px',
                                                    border: '1px solid',
                                                    borderColor: isSelected 
                                                        ? 'primary.main' 
                                                        : isToday 
                                                            ? 'rgba(0, 106, 106, 0.3)' 
                                                            : 'divider',
                                                    bgcolor: isSelected 
                                                        ? 'rgba(0, 106, 106, 0.03)' 
                                                        : cell.isCurrentMonth 
                                                            ? 'background.paper' 
                                                            : 'action.hover',
                                                    opacity: cell.isCurrentMonth ? 1 : 0.5,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                        borderColor: isSelected ? 'primary.main' : 'primary.light'
                                                    }
                                                }}
                                            >
                                                {/* Day Number Header */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontWeight: isToday || isSelected ? 700 : 500,
                                                            color: isToday ? 'primary.main' : 'text.primary',
                                                            fontFamily: "'Outfit', sans-serif"
                                                        }}
                                                    >
                                                        {cell.dayNum}
                                                    </Typography>
                                                    
                                                    {isToday && (
                                                        <Box 
                                                            sx={{ 
                                                                width: '6px', 
                                                                height: '6px', 
                                                                borderRadius: '50%', 
                                                                bgcolor: 'primary.main' 
                                                            }} 
                                                        />
                                                    )}
                                                </Box>

                                                {/* Appointment List (Month Cells) */}
                                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflow: 'hidden' }}>
                                                    {appts.slice(0, 2).map(appt => {
                                                        const cfg = statusConfig[appt.status] || { text: '#9E9E9E', bg: 'rgba(0,0,0,0.04)' };
                                                        const labelText = role === 'DOCTOR' 
                                                            ? appt.patient?.user?.full_name 
                                                            : `Dr. ${appt.doctor?.user?.full_name}`;
                                                        
                                                        return (
                                                            <Tooltip 
                                                                title={`${format12Hour(appt.start_time)} - ${labelText}`} 
                                                                key={appt.id}
                                                                arrow
                                                            >
                                                                <Box
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onAppointmentClick(appt);
                                                                    }}
                                                                    sx={{
                                                                        px: 0.8,
                                                                        py: 0.2,
                                                                        borderRadius: '6px',
                                                                        bgcolor: cfg.bg,
                                                                        borderLeft: `3px solid ${cfg.text}`,
                                                                        color: cfg.text,
                                                                        fontSize: '10px',
                                                                        fontWeight: 700,
                                                                        whiteSpace: 'nowrap',
                                                                        textOverflow: 'ellipsis',
                                                                        overflow: 'hidden',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5
                                                                    }}
                                                                >
                                                                    <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 800, flexShrink: 0 }}>
                                                                        {appt.start_time.substring(0, 5)}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {labelText}
                                                                    </Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                    
                                                    {appts.length > 2 && (
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                fontSize: '9.5px', 
                                                                fontWeight: 700, 
                                                                color: 'primary.main', 
                                                                mt: 0.2, 
                                                                textAlign: 'center' 
                                                            }}
                                                        >
                                                            + {appts.length - 2} more
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="week-view"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Week View Columns */}
                            <Grid container spacing={2} columns={7}>
                                {weekDays.map(day => {
                                    const appts = appointmentsByDate[day.dateStr] || [];
                                    const isSelected = selectedDateStr === day.dateStr;
                                    const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

                                    return (
                                        <Grid item xs={12} sm={4} md={1} key={day.dateStr} sx={{ minWidth: { md: '14%' } }}>
                                            <Paper
                                                onClick={() => setSelectedDateStr(day.dateStr)}
                                                sx={{
                                                    minHeight: '280px',
                                                    p: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                    cursor: 'pointer',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: isSelected 
                                                        ? 'primary.main' 
                                                        : isToday 
                                                            ? 'rgba(0, 106, 106, 0.3)' 
                                                            : 'divider',
                                                    bgcolor: isSelected 
                                                        ? 'rgba(0, 106, 106, 0.02)' 
                                                        : 'background.paper',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {/* Weekday Column Header */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                                                        {day.dayName}
                                                    </Typography>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 800, 
                                                            color: isToday ? 'primary.main' : 'text.primary',
                                                            fontFamily: "'Outfit', sans-serif"
                                                        }}
                                                    >
                                                        {day.dayNum}
                                                    </Typography>
                                                </Box>

                                                {/* Appointment List (Week Column) */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                                                    {appts.length === 0 ? (
                                                        <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', py: 4 }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                                                                No slots
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        appts.map(appt => {
                                                            const cfg = statusConfig[appt.status] || { text: '#9E9E9E', bg: 'rgba(0,0,0,0.04)' };
                                                            const labelText = role === 'DOCTOR' 
                                                                ? appt.patient?.user?.full_name 
                                                                : appt.doctor?.user?.full_name;

                                                            return (
                                                                <Box
                                                                    key={appt.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onAppointmentClick(appt);
                                                                    }}
                                                                    sx={{
                                                                        p: 1.2,
                                                                        borderRadius: '12px',
                                                                        bgcolor: cfg.bg,
                                                                        borderLeft: `4px solid ${cfg.text}`,
                                                                        transition: 'all 0.2s',
                                                                        '&:hover': {
                                                                            transform: 'scale(1.03)',
                                                                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                                        <Clock size={10} style={{ color: cfg.text }} />
                                                                        <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 800, color: cfg.text }}>
                                                                            {format12Hour(appt.start_time)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {role === 'DOCTOR' ? labelText : `Dr. ${labelText}`}
                                                                    </Typography>
                                                                </Box>
                                                            );
                                                        })
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Daily Agenda Collapse Drawer */}
            <Collapse in={!!selectedDateStr} mountOnEnter unmountOnExit>
                <Divider />
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon size={20} style={{ color: theme.palette.primary.main }} />
                        Agenda for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Typography>

                    {selectedDateAppointments.length === 0 ? (
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 4, 
                                borderRadius: '16px', 
                                textAlign: 'center', 
                                borderStyle: 'dashed',
                                bgcolor: 'transparent'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                No consultations scheduled for this date.
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={2}>
                            {selectedDateAppointments.map(appt => {
                                const cfg = statusConfig[appt.status] || { text: '#9E9E9E', bg: 'rgba(0,0,0,0.04)', icon: Clock };
                                const StatusIcon = cfg.icon;
                                const otherUser = role === 'DOCTOR' ? appt.patient?.user : appt.doctor?.user;

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={appt.id}>
                                        <Card 
                                            variant="outlined"
                                            onClick={() => onAppointmentClick(appt)}
                                            sx={{ 
                                                cursor: 'pointer',
                                                borderRadius: '16px',
                                                transition: 'all 0.2s',
                                                bgcolor: isDark ? 'rgba(255,255,255,0.01)' : '#FFFFFF',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                {/* Header Status */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Chip 
                                                        icon={<StatusIcon size={12} style={{ color: cfg.text }} />}
                                                        label={cfg.label} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontSize: '11px', 
                                                            fontWeight: 700, 
                                                            bgcolor: cfg.bg, 
                                                            color: cfg.text,
                                                            border: `1px solid ${cfg.border}`,
                                                            '& .MuiChip-icon': { ml: 0.5, mr: -0.5 }
                                                        }} 
                                                    />
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <Clock size={14} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                            {format12Hour(appt.start_time)}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Profile Details */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                    <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: '10px', display: 'flex' }}>
                                                        <User size={16} />
                                                    </Box>
                                                    <Box sx={{ overflow: 'hidden' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {role === 'DOCTOR' ? otherUser?.full_name : `Dr. ${otherUser?.full_name}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {role === 'DOCTOR' ? `Patient MRN: ${appt.patient?.mrn}` : appt.doctor?.specialization}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Booking Reason */}
                                                {appt.reason && (
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, p: 1.2, bgcolor: 'action.hover', borderRadius: '10px' }}>
                                                        <FileText size={14} style={{ opacity: 0.6, flexShrink: 0, marginTop: 2 }} />
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                                            {appt.reason}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};
