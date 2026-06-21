import { useState, useEffect, useMemo } from 'react';
import { 
    Box, Card, CardContent, Typography, Button, 
    Select, MenuItem, InputLabel, FormControl, Chip, 
    Skeleton, useTheme, Divider, Popover
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
    Hotel, Plus, Search, RefreshCw, User, 
    CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { api as axiosInstance } from '../../../lib/api';
import { AdmitPatientDialog } from '../dialogs/AdmitPatientDialog';
import { CreateWardDialog } from '../dialogs/CreateWardDialog';
import { CreateBedDialog } from '../dialogs/CreateBedDialog';
import { ConfirmDischargeDialog } from '../dialogs/ConfirmDischargeDialog';
import { 
    AdminPageHeader, StatGrid, StatCard, DashboardCard, AsyncWrapper, ToastNotification
} from '../../../shared/components/ui';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { useToast } from '../../../hooks/useToast';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const AdminIPD = () => {
    const theme = useTheme();
    const { 
        wards = [], beds = [], admissions = [], 
        loadingStates, errorStates, 
        refreshWards, refreshBeds, refreshAdmissions, 
        setBeds, setWards, setAdmissions 
    } = useAdmin();

    const loading = loadingStates.wards || loadingStates.beds || loadingStates.admissions;
    const error = errorStates.wards || errorStates.beds || errorStates.admissions;

    const [wardSearch, setWardSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [doctorsLoading, setDoctorsLoading] = useState(false);

    const [openAdmitDialog, setOpenAdmitDialog] = useState(false);
    const [openWardDialog, setOpenWardDialog] = useState(false);
    const [openBedDialog, setOpenBedDialog] = useState(false);

    const [selectedBed, setSelectedBed] = useState(null);
    const [admissionPatient, setAdmissionPatient] = useState('');
    const [admissionDoctor, setAdmissionDoctor] = useState('');
    const [admissionBed, setAdmissionBed] = useState('');
    const [admissionReason, setAdmissionReason] = useState('');
    const [admitSubmitting, setAdmitSubmitting] = useState(false);
    const [admitError, setAdmitError] = useState('');

    const [wardName, setWardName] = useState('');
    const [wardCategory, setWardCategory] = useState('GENERAL');
    const [wardRate, setWardRate] = useState('');
    const [wardDept, setWardDept] = useState('');
    const [wardSubmitting, setWardSubmitting] = useState(false);

    const [bedNumber, setBedNumber] = useState('');
    const [bedWard, setBedWard] = useState('');
    const [bedSubmitting, setBedSubmitting] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    const [dischargeOpen, setDischargeOpen] = useState(false);
    const [dischargeData, setDischargeData] = useState({ admissionId: null, bedId: null, bedNum: '', patientName: '' });

    const [anchorEl, setAnchorEl] = useState(null);
    const [activeBed, setActiveBed] = useState(null);
    const [statusChanging, setStatusChanging] = useState(false);

    const handleBedClick = (event, bed) => {
        setAnchorEl(event.currentTarget);
        setActiveBed(bed);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setActiveBed(null);
    };

    const isPopoverOpen = Boolean(anchorEl);

    useEffect(() => {
        const loadFormData = async () => {
            setPatientsLoading(true);
            setDoctorsLoading(true);
            try {
                const [patientsRes, doctorsRes, deptRes] = await Promise.all([
                    axiosInstance.get('auth/patients/'),
                    axiosInstance.get('auth/doctors/'),
                    axiosInstance.get('auth/departments/')
                ]);
                setPatients(patientsRes.data.results || patientsRes.data);
                setDoctors(doctorsRes.data.results || doctorsRes.data);
                setDepartments(deptRes.data.results || deptRes.data);
            } catch (err) {
                // Silently handle error as UI will indicate empty state
            } finally {
                setPatientsLoading(false);
                setDoctorsLoading(false);
            }
        };
        loadFormData();
    }, []);

    useEffect(() => {
        refreshWards();
        refreshBeds();
        refreshAdmissions();
    }, [refreshWards, refreshBeds, refreshAdmissions]);

    const getActiveAdmission = (bedId) => {
        return admissions.find(adm => adm.bed === bedId && adm.status === 'ADMITTED');
    };

    const handleQuickAdmitClick = (bed) => {
        setSelectedBed(bed);
        setAdmissionBed(bed.id);
        setAdmissionPatient('');
        setAdmissionDoctor('');
        setAdmissionReason('');
        setAdmitError('');
        setOpenAdmitDialog(true);
        handlePopoverClose();
    };

    const handleAdmitSubmit = async (e) => {
        e.preventDefault();
        setAdmitSubmitting(true);
        setAdmitError('');
        try {
            const data = await adminApi.createAdmission({
                patient: admissionPatient,
                bed: admissionBed,
                attending_doctor: admissionDoctor,
                admission_reason: admissionReason
            });
            setBeds(prev => prev.map(b => b.id === admissionBed ? { ...b, status: 'OCCUPIED' } : b));
            setAdmissions(prev => [data, ...prev]);
            
            // Update available_beds locally
            const bedObj = beds.find(b => b.id === admissionBed);
            if (bedObj) {
                setWards(prev => prev.map(w => w.id === bedObj.ward ? { ...w, available_beds: Math.max(0, (w.available_beds || 0) - 1) } : w));
            }
            
            showToast('Patient admitted successfully.', 'success');
            setOpenAdmitDialog(false);
        } catch (err) {
            setAdmitError(err.response?.data?.detail || err.response?.data?.bed?.[0] || 'Failed to submit admission record.');
        } finally {
            setAdmitSubmitting(false);
        }
    };

    const handleDischargeClick = (admissionId, bedId) => {
        const admission = admissions.find(a => a.id === admissionId);
        const bed = beds.find(b => b.id === bedId);
        setDischargeData({ admissionId, bedId, bedNum: bed?.bed_number || '', patientName: admission?.patient_name || '' });
        setDischargeOpen(true);
    };

    const handleConfirmDischarge = async () => {
        const { admissionId, bedId } = dischargeData;
        if (!admissionId) return;
        setStatusChanging(true);
        try {
            await adminApi.dischargeAdmission(admissionId);
            setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: 'CLEANING' } : b));
            setAdmissions(prev => prev.map(a => a.id === admissionId ? { ...a, status: 'DISCHARGED', discharged_at: new Date().toISOString() } : a));
            showToast('Patient discharged successfully. Bed scheduled for cleaning.', 'success');
            setDischargeOpen(false);
            handlePopoverClose();
        } catch (err) {
            showToast('Failed to discharge patient.', 'error');
        } finally {
            setStatusChanging(false);
        }
    };

    const handleUpdateBedStatus = async (bedId, newStatus) => {
        setStatusChanging(true);
        try {
            await adminApi.updateBed(bedId, { status: newStatus });
            
            // Update available_beds count locally
            const bedObj = beds.find(b => b.id === bedId);
            if (bedObj) {
                const wasAvailable = bedObj.status === 'AVAILABLE';
                const isNowAvailable = newStatus === 'AVAILABLE';
                if (wasAvailable !== isNowAvailable) {
                    const diff = isNowAvailable ? 1 : -1;
                    setWards(prev => prev.map(w => w.id === bedObj.ward ? { ...w, available_beds: Math.max(0, (w.available_beds || 0) + diff) } : w));
                }
            }
            
            setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: newStatus } : b));
            showToast(`Bed status updated to ${newStatus}.`, 'success');
            handlePopoverClose();
        } catch (err) {
            showToast('Failed to update bed status.', 'error');
        } finally {
            setStatusChanging(false);
        }
    };

    const handleWardSubmit = async (e) => {
        e.preventDefault();
        setWardSubmitting(true);
        try {
            const data = await adminApi.createWard({
                name: wardName,
                category: wardCategory,
                daily_rate: parseFloat(wardRate),
                department: wardDept || null
            });
            setWards(prev => [...prev, data]);
            setOpenWardDialog(false);
            setWardName('');
            setWardRate('');
            setWardDept('');
            showToast(`Ward "${data.name}" registered successfully.`, 'success');
        } catch (err) {
            showToast('Failed to create ward.', 'error');
        } finally {
            setWardSubmitting(false);
        }
    };

    const handleBedSubmit = async (e) => {
        e.preventDefault();
        setBedSubmitting(true);
        try {
            const data = await adminApi.createBed({
                ward: bedWard,
                bed_number: bedNumber
            });
            setBeds(prev => [...prev, data]);
            
            // Update total_beds and available_beds locally (bed starts as AVAILABLE by default)
            setWards(prev => prev.map(w => w.id === bedWard ? { ...w, total_beds: (w.total_beds || 0) + 1, available_beds: (w.available_beds || 0) + 1 } : w));
            
            setOpenBedDialog(false);
            setBedNumber('');
            showToast(`Bed "${data.bed_number}" registered successfully.`, 'success');
        } catch (err) {
            showToast('Failed to create bed.', 'error');
        } finally {
            setBedSubmitting(false);
        }
    };

    const handleSyncAll = () => {
        refreshWards();
        refreshBeds();
        refreshAdmissions();
    };

    const stats = useMemo(() => {
        const total = beds.length;
        const occupied = beds.filter(b => b.status === 'OCCUPIED').length;
        const available = beds.filter(b => b.status === 'AVAILABLE').length;
        const cleaning = beds.filter(b => b.status === 'CLEANING').length;
        const maintenance = beds.filter(b => b.status === 'MAINTENANCE').length;
        return { total, occupied, available, cleaning, maintenance };
    }, [beds]);

    const filteredWards = useMemo(() => {
        return wards.filter(ward => {
            const nameMatch = (ward.name || '').toLowerCase().includes(wardSearch.toLowerCase());
            const catMatch = categoryFilter === 'ALL' || ward.category === categoryFilter;
            return nameMatch && catMatch;
        });
    }, [wards, wardSearch, categoryFilter]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title="In-Patient Department (IPD) Occupancy"
                subtitle="Monitor real-time bed configurations, admit emergency triages, manage ward maps, and log discharges."
                onRefresh={handleSyncAll}
                loading={loading}
                refreshLabel="Sync Bed Map"
                actionButton={
                    <Button 
                        variant="contained" 
                        startIcon={<Plus size={16} />}
                        onClick={() => {
                            setSelectedBed(null);
                            setAdmissionBed('');
                            setAdmissionPatient('');
                            setAdmissionDoctor('');
                            setAdmissionReason('');
                            setAdmitError('');
                            setOpenAdmitDialog(true);
                        }}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Admit Patient
                    </Button>
                }
            />

            <AsyncWrapper loading={false} error={error}>
                <StatGrid cols={4}>
                    <StatCard title="Total Beds Registered" value={stats.total} description="Bed infrastructure" icon={Hotel} color={COLORS.PRIMARY} loading={loading} />
                    <StatCard title="Available Beds" value={stats.available} description="Immediate occupancy" icon={CheckCircle2} color={COLORS.SUCCESS} loading={loading} />
                    <StatCard title="Occupied Beds" value={stats.occupied} description="Patient admitted" icon={User} color={COLORS.INFO} loading={loading} />
                    <StatCard title="Under Cleaning" value={stats.cleaning} description="Triage turnaround status" icon={RefreshCw} color={COLORS.WARNING} loading={loading} />
                </StatGrid>

                <AdminFilterBar
                    searchQuery={wardSearch}
                    onSearchChange={setWardSearch}
                    searchPlaceholder="Filter wards by name..."
                >
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {['ALL', 'GENERAL', 'PRIVATE', 'ICU', 'CCU'].map((cat) => (
                            <Chip 
                                key={cat} 
                                label={cat === 'ALL' ? 'All Wards' : cat} 
                                onClick={() => setCategoryFilter(cat)}
                                variant={categoryFilter === cat ? 'filled' : 'outlined'}
                                color={categoryFilter === cat ? 'primary' : 'default'}
                                sx={{ fontWeight: 600, height: 32 }}
                            />
                        ))}
                    </Box>
                </AdminFilterBar>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Plus size={14} />} onClick={() => setOpenWardDialog(true)} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.primary' }}>
                        Register New Ward
                    </Button>
                    <Button variant="outlined" startIcon={<Plus size={14} />} onClick={() => setOpenBedDialog(true)} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.primary' }}>
                        Add Bed to Ward
                    </Button>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                    {loading && wards.length === 0 ? (
                        [1, 2].map((n) => (
                            <Skeleton key={n} variant="rectangular" height={200} sx={{ borderRadius: '8px' }} />
                        ))
                    ) : filteredWards.length === 0 ? (
                        <Card sx={{ borderRadius: '8px', py: 8, textAlign: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>No IPD Wards Found</Typography>
                            <Typography variant="caption" color="text.secondary">Try adjusting your filters or use the buttons above to register wards.</Typography>
                        </Card>
                    ) : (
                        filteredWards.map((ward) => {
                            const wardBeds = beds.filter(b => b.ward === ward.id);
                            const categoryColors = { 'GENERAL': COLORS.PRIMARY, 'PRIVATE': COLORS.INFO, 'ICU': COLORS.DANGER, 'CCU': COLORS.WARNING };
                            const occupiedRatio = wardBeds.length > 0 ? (wardBeds.filter(b => b.status === 'OCCUPIED').length / wardBeds.length) * 100 : 0;

                            return (
                                <Card key={ward.id} sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
                                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Hotel style={{ color: categoryColors[ward.category] || '#555' }} />
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING }}>{ward.name}</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                                    <Chip label={ward.category} size="small" sx={{ fontSize: '9px', fontWeight: 700, bgcolor: `${categoryColors[ward.category]}11`, color: categoryColors[ward.category] }} />
                                                    <Typography variant="caption" color="text.secondary">Daily Rate: <strong>Rs. {parseFloat(ward.daily_rate).toLocaleString()}</strong></Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{ward.available_beds} / {ward.total_beds} Available Beds</Typography>
                                            <Typography variant="caption" color="text.secondary">Occupancy Rate: {Math.round(occupiedRatio)}%</Typography>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? '#141A1A' : '#FAFAFA' }}>
                                        {wardBeds.length === 0 ? (
                                            <Typography variant="caption" color="text.disabled" sx={{ py: 2, display: 'block' }}>This ward does not contain any beds. Use "Add Bed to Ward" to configure.</Typography>
                                        ) : (
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                                {wardBeds.map((bed) => {
                                                    let statusColor = '#E2E8F0';
                                                    let statusBg = 'rgba(0,0,0,0.03)';
                                                    let textStyleColor = 'text.secondary';

                                                    if (bed.status === 'AVAILABLE') { statusColor = COLORS.SUCCESS; statusBg = `${COLORS.SUCCESS}15`; textStyleColor = COLORS.SUCCESS; }
                                                    else if (bed.status === 'OCCUPIED') { statusColor = COLORS.INFO; statusBg = `${COLORS.INFO}15`; textStyleColor = COLORS.INFO; }
                                                    else if (bed.status === 'CLEANING') { statusColor = COLORS.WARNING; statusBg = `${COLORS.WARNING}15`; textStyleColor = COLORS.WARNING; }
                                                    else if (bed.status === 'MAINTENANCE') { statusColor = COLORS.DANGER; statusBg = `${COLORS.DANGER}15`; textStyleColor = COLORS.DANGER; }

                                                    const admission = getActiveAdmission(bed.id);

                                                    return (
                                                        <Box
                                                            key={bed.id}
                                                            component={motion.div}
                                                            whileHover={{ scale: 1.03, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={(e) => handleBedClick(e, bed)}
                                                            sx={{
                                                                p: 2, borderRadius: '8px', border: '1px solid',
                                                                borderColor: bed.status === 'OCCUPIED' ? 'transparent' : 'divider',
                                                                bgcolor: statusBg, cursor: 'pointer',
                                                                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25,
                                                                '&:hover': { borderColor: statusColor, boxShadow: `0 4px 12px ${statusBg}` }
                                                            }}
                                                        >
                                                            <Hotel size={24} style={{ color: statusColor }} />
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, color: textStyleColor }}>
                                                                    Bed {bed.bed_number}
                                                                </Typography>
                                                                {bed.status === 'OCCUPIED' && admission && (
                                                                    <Typography variant="caption" sx={{ fontSize: '10px', display: 'block', color: textStyleColor, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {admission.patient_name}
                                                                    </Typography>
                                                                )}
                                                                <Chip label={bed.status} size="small" sx={{ height: 14, fontSize: '8px', fontWeight: 700, mt: 0.5, bgcolor: 'rgba(255,255,255,0.7)', color: statusColor, border: `1px solid ${statusColor}` }} />
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Box>
            </AsyncWrapper>

            <Popover
                open={isPopoverOpen} anchorEl={anchorEl} onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{ sx: { p: 2.5, width: 320, borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}
            >
                {activeBed && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING }}>Bed {activeBed.bed_number} Details</Typography>
                            <Chip label={activeBed.status} size="small" color={activeBed.status === 'AVAILABLE' ? 'success' : activeBed.status === 'OCCUPIED' ? 'info' : 'warning'} />
                        </Box>
                        <Divider />
                        {activeBed.status === 'OCCUPIED' ? (
                            (() => {
                                const admission = getActiveAdmission(activeBed.id);
                                if (!admission) return <Typography variant="caption">Record sync anomaly. No active admission found.</Typography>;
                                return (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Patient:</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{admission.patient_name}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Attending Clinician:</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>Dr. {admission.doctor_name}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Admission Reason:</Typography><Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '12.5px' }}>{admission.admission_reason}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Admitted At:</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>{new Date(admission.admitted_at).toLocaleString()}</Typography></Box>
                                        <Button variant="contained" color="error" size="small" disabled={statusChanging} onClick={() => handleDischargeClick(admission.id, activeBed.id)} sx={{ mt: 1, borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}>Discharge Patient</Button>
                                    </Box>
                                );
                            })()
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {activeBed.status === 'AVAILABLE' ? (
                                    <Button variant="contained" size="small" onClick={() => handleQuickAdmitClick(activeBed)} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}>Admit Patient Here</Button>
                                ) : activeBed.status === 'CLEANING' ? (
                                    <Button variant="outlined" size="small" disabled={statusChanging} onClick={() => handleUpdateBedStatus(activeBed.id, 'AVAILABLE')} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}>Mark Ready (Available)</Button>
                                ) : null}

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Force Status</InputLabel>
                                    <Select value={activeBed.status} label="Force Status" disabled={statusChanging} onChange={(e) => handleUpdateBedStatus(activeBed.id, e.target.value)} sx={{ borderRadius: '12px' }}>
                                        <MenuItem value="AVAILABLE">Available</MenuItem>
                                        <MenuItem value="CLEANING">Under Cleaning</MenuItem>
                                        <MenuItem value="MAINTENANCE">Out of Service</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        )}
                    </Box>
                )}
            </Popover>

            <AdmitPatientDialog open={openAdmitDialog} onClose={() => setOpenAdmitDialog(false)} onSubmit={handleAdmitSubmit} patients={patients} patientsLoading={patientsLoading} doctors={doctors} doctorsLoading={doctorsLoading} beds={beds} wards={wards} selectedBed={selectedBed} admissionPatient={admissionPatient} setAdmissionPatient={setAdmissionPatient} admissionDoctor={admissionDoctor} setAdmissionDoctor={setAdmissionDoctor} admissionBed={admissionBed} setAdmissionBed={setAdmissionBed} admissionReason={admissionReason} setAdmissionReason={setAdmissionReason} admitSubmitting={admitSubmitting} admitError={admitError} />
            <CreateWardDialog open={openWardDialog} onClose={() => setOpenWardDialog(false)} onSubmit={handleWardSubmit} wardName={wardName} setWardName={setWardName} wardCategory={wardCategory} setWardCategory={setWardCategory} wardRate={wardRate} setWardRate={setWardRate} wardDept={wardDept} setWardDept={setWardDept} departments={departments} wardSubmitting={wardSubmitting} />
            <CreateBedDialog open={openBedDialog} onClose={() => setOpenBedDialog(false)} onSubmit={handleBedSubmit} wards={wards} bedWard={bedWard} setBedWard={setBedWard} bedNumber={bedNumber} setBedNumber={setBedNumber} bedSubmitting={bedSubmitting} />
            <ConfirmDischargeDialog open={dischargeOpen} onClose={() => setDischargeOpen(false)} onConfirm={handleConfirmDischarge} bedNumber={dischargeData.bedNum} patientName={dischargeData.patientName} submitting={statusChanging} />
            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminIPD;
