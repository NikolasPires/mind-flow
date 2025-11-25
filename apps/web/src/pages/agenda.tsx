import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Stack,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { FiPlus } from 'react-icons/fi';
import styles from '../styles/Agenda.module.css';
import { consultaService, Consulta } from '../services/consultaService';
import { pacienteService, Paciente } from '../services/pacienteService';
import { NextPageWithAuth } from '@/types/page-auth';
import CreatePatientForm from '../components/CreatePatientForm';
import CreateAppointmentModal from '../components/CreateAppointmentModal'; // <--- Import do novo modal

interface Appointment {
  id: string | number;
  time: string;
  startTime: number;
  endTime: number;
  patient: string;
  type: string;
  status: 'CONFIRMADO' | 'CANCELADO' | 'A_CONFIRMAR';
  statusColor: 'success' | 'warning' | 'error';
  dataDaConsulta: string;
  category: string;
  tags: string[];
}

const Agenda: NextPageWithAuth = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session, status: sessionStatus } = useSession();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  
 const [openEditModal, setOpenEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editConsulta, setEditConsulta] = useState({
    id: '',
    paciente_id: '',
    horario: '',
    tipo: '',
    categoria: '',
    tags: [] as string[],
    tagInput: '',
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState<Date | null>(null);
  
  const [openCreatePatientModal, setOpenCreatePatientModal] = useState(false);

  // Carregar consultas da API
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setLoading(true);
      return;
    }

    if (sessionStatus === 'unauthenticated' || !session) {
      setLoading(false);
      setError('Você precisa estar autenticado para ver as consultas');
      return;
    }

    if (sessionStatus === 'authenticated' && session) {
      loadConsultas();
      loadPacientes();
    }
  }, [session, sessionStatus]);

  const loadPacientes = async () => {
    if (!session) return;
    try {
      const token = session.accessToken as string;
      const data = await pacienteService.listPacientes(token);
      setPacientes(data);
    } catch (err: any) {
      console.error('Erro ao carregar pacientes:', err);
      setPacientes([]);
    }
  };

  const loadConsultas = async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const token = session.accessToken as string;

      const data = await consultaService.listConsultas(token);
      setConsultas(data);

      const convertedAppointments: Appointment[] = data.map((consulta) => {
        const horario = new Date(consulta.horario);
        const startTime = horario.getHours();
        const endTime = startTime + 1; 

        const timeStr = `${startTime.toString().padStart(2, '0')}:00 - ${endTime.toString().padStart(2, '0')}:00`;

        const statusColor = consulta.status === 'CONFIRMADO' ? 'success' :
          consulta.status === 'CANCELADO' ? 'error' : 'warning';

        return {
          id: consulta.id,
          time: timeStr,
          startTime,
          endTime,
          patient: consulta.paciente?.name || 'Paciente não encontrado',
          type: consulta.tipo,
          status: consulta.status,
          statusColor,
          dataDaConsulta: consulta.horario,
          category: consulta.categoria,
          tags: consulta.tags,
        };
      });

      setAppointments(convertedAppointments);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar consultas');
      console.error('Erro ao carregar consultas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (appointment: Appointment) => {
    const consulta = consultas.find(c => c.id === appointment.id);
    if (consulta) {
      const horarioDate = new Date(consulta.horario);
      const horarioLocal = new Date(horarioDate.getTime() - horarioDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      const paciente = pacientes.find(p => p.name === appointment.patient);
      
      setEditConsulta({
        id: consulta.id,
        paciente_id: consulta.paciente_id || paciente?.id || '',
        horario: horarioLocal,
        tipo: consulta.tipo,
        categoria: consulta.categoria,
        tags: consulta.tags || [],
        tagInput: '',
      });
      setOpenEditModal(true);
      setOpenModal(false);
    }
  };

  const handleUpdateConsulta = async () => {
    try {
      setEditLoading(true);
      setError(null);

      const token = session?.accessToken as string;
      const consultaData = {
        paciente_id: String(editConsulta.paciente_id).trim(),
        horario: editConsulta.horario,
        tipo: editConsulta.tipo,
        categoria: editConsulta.categoria,
        tags: editConsulta.tags,
      };

      await consultaService.updateConsulta(editConsulta.id, consultaData, token);

      setOpenEditModal(false);
      await loadConsultas();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar consulta');
    } finally {
      setEditLoading(false);
    }
  };

  const addEditTag = () => {
    if (editConsulta.tagInput.trim() && !editConsulta.tags.includes(editConsulta.tagInput.trim())) {
      setEditConsulta({
        ...editConsulta,
        tags: [...editConsulta.tags, editConsulta.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeEditTag = (tag: string) => {
    setEditConsulta({
      ...editConsulta,
      tags: editConsulta.tags.filter(t => t !== tag),
    });
  };

  // --- LÓGICA DE EXCLUSÃO ---
  const handleDeleteConsulta = async (appointmentId: string | number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }
    try {
      setError(null);
      const token = session?.accessToken as string;
      await consultaService.deleteConsulta(String(appointmentId), token);
      setOpenModal(false);
      await loadConsultas();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir consulta');
    }
  };

  const handlePatientCreated = async () => {
    await loadPacientes();
    setOpenCreatePatientModal(false);
  };

  const handleOpenModal = (appointment: Appointment, occurrenceDate?: Date) => {
    setSelectedAppointment(appointment);
    setSelectedOccurrenceDate(occurrenceDate ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
    setSelectedOccurrenceDate(null);
  };

  // Funções de Data/Calendário
  const getDayName = (dayIndex: number) => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    return days[dayIndex];
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const diffToMonday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getDayDate = (dayIndex: number) => {
    const start = getWeekStart(currentDate);
    const date = new Date(start);
    date.setDate(start.getDate() + dayIndex);
    return date.getDate();
  };

  const getMonthYear = () => {
    const start = getWeekStart(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const month = start.toLocaleDateString('pt-BR', { month: 'long' });
      const year = start.getFullYear();
      return `${start.getDate()} - ${end.getDate()} de ${month}, ${year}`;
    }

    const startLabel = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const endLabel = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const year = start.getFullYear() === end.getFullYear() ? start.getFullYear() : `${start.getFullYear()} / ${end.getFullYear()}`;
    return `${startLabel} - ${endLabel}, ${year}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getAppointmentPosition = (startTime: number) => (startTime - 9) * 60;
  const getAppointmentHeight = (startTime: number, endTime: number) => (endTime - startTime) * 60;

  const getUpcomingAppointments = (daysAhead = 21) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const map: Record<string, { date: Date; items: Appointment[] }> = {};
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: d, items: [] };
    }

    appointments.forEach(apt => {
      const apDate = new Date(apt.dataDaConsulta);
      apDate.setHours(0, 0, 0, 0);
      const key = apDate.toISOString().slice(0, 10);
      if (map[key]) {
        map[key].items.push(apt);
      }
    });

    return Object.keys(map)
      .filter(k => map[k].items.length > 0)
      .sort()
      .map(k => ({
        key: k,
        day: map[k].date,
        items: map[k].items.sort((a: any, b: any) => (a.startTime ?? 0) - (b.startTime ?? 0))
      }));
  };

  const upcoming = getUpcomingAppointments(21);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <div className={styles.agendaContainer}>
      <Container maxWidth="xl">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Header da Agenda */}
        <Box className={styles.headerSection}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                Agenda (Semana)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent={isMobile ? 'center' : 'flex-end'}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton onClick={() => navigateWeek('prev')} size="small">
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px', textAlign: 'center' }}>
                    {getMonthYear()}
                  </Typography>
                  <IconButton onClick={() => navigateWeek('next')} size="small">
                    <ChevronRight />
                  </IconButton>
                </Stack>

                <Stack direction={isMobile ? 'column' : 'row'} spacing={1} width={isMobile ? '100%' : 'auto'}>
                  <Button
                    variant="outlined"
                    startIcon={<FiPlus size={18} />}
                    onClick={() => setOpenCreatePatientModal(true)}
                    sx={{
                      borderColor: 'var(--primary-color, #00897b)',
                      color: 'var(--primary-color, #00897b)',
                      '&:hover': {
                        borderColor: '#00695c',
                        color: '#00695c',
                      },
                      minWidth: isMobile ? '100%' : 'auto',
                    }}
                  >
                    {isMobile ? 'Novo Paciente' : 'Adicionar Paciente'}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenCreateModal(true)} // Abre o novo modal
                    sx={{
                      backgroundColor: 'var(--primary-color, #00897b)',
                      '&:hover': { backgroundColor: '#00695c' },
                      minWidth: isMobile ? '100%' : 'auto',
                    }}
                  >
                    {isMobile ? 'Agendar' : 'Agendar Nova Sessão'}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Grid do Calendário */}
        <Paper className={styles.calendarGrid}>
          <Grid container>
            {/* Eixo de tempo */}
            <Grid item xs={1} className={styles.timeAxis}>
              <Box sx={{ height: '600px', position: 'relative' }}>
                {Array.from({ length: 11 }, (_, i) => {
                  const hour = 8 + i;
                  return (
                    <Box key={hour} className={styles.timeSlot}>
                      {hour.toString().padStart(2, '0')}:00
                    </Box>
                  );
                })}
              </Box>
            </Grid>

            {/* Dias da semana */}
            <Grid item xs={11}>
              <Grid container>
                {Array.from({ length: 7 }, (_, i) => (
                  <Grid item xs={12 / 7} key={i}>
                    <Box className={styles.dayHeader}>
                      <Typography className={styles.dayName}>
                        {getDayName(i)}
                      </Typography>
                      <Typography className={styles.dayDate}>
                        {getDayDate(i)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box className={styles.appointmentsContainer}>
                {/* Linhas de grade */}
                {Array.from({ length: 11 }, (_, i) => (
                  <Box
                    key={i}
                    className={styles.gridLine}
                    sx={{ top: i * 60 }}
                  />
                ))}

                {/* Colunas dos dias */}
                {Array.from({ length: 7 }, (_, dayIndex) => (
                  <Box
                    key={dayIndex}
                    className={styles.dayColumn}
                    sx={{
                      left: `${(dayIndex * 100) / 7}%`,
                      width: `${100 / 7}%`,
                    }}
                  />
                ))}

                {/* Agendamentos */}
                {appointments
                  .filter((appointment) => {
                    const weekStart = getWeekStart(currentDate);
                    const appointmentDate = new Date(appointment.dataDaConsulta);
                    return appointmentDate >= weekStart && appointmentDate < new Date(weekStart.getTime() + 7 * 86400000);
                  })
                  .map((appointment) => {
                    const appointmentDate = new Date(appointment.dataDaConsulta);
                    const dayIndex = (appointmentDate.getDay() + 6) % 7;

                    return (
                      <Paper
                        key={appointment.id}
                        className={`${styles.appointmentCard} ${styles[appointment.statusColor === 'success' ? 'confirmed' : 'pending']}`}
                        sx={{
                          left: `${(dayIndex * 100) / 7 + 2}%`,
                          width: `${100 / 7 - 4}%`,
                          top: `${getAppointmentPosition(appointment.startTime)}px`,
                          height: `${getAppointmentHeight(appointment.startTime, appointment.endTime)}px`,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenModal(appointment, appointmentDate)}
                      >
                        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                          <Typography className={styles.appointmentPatient} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', maxWidth: '100%' }}>
                            {appointment.patient}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Lista de próximas consultas */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Próximas consultas</Typography>
          <Divider />
          <Box mt={2}>
            {upcoming.length === 0 ? (
              <Typography color="text.secondary">Nenhuma consulta agendada nos próximos dias.</Typography>
            ) : (
              upcoming.map(group => {
                const dateLabel = group.day.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
                return (
                  <Box key={group.key} mb={2}>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>{dateLabel}</Typography>
                    <Box mt={1}>
                      {group.items.map((apt) => {
                        const parts = group.key.split('-');
                        const occurrence = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                        return (
                          <Paper key={`${group.key}-${apt.id}`} className={styles.upcomingItem} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">{apt.time}</Typography>
                              <Typography variant="body1">{apt.patient}</Typography>
                              <Typography variant="caption" color="text.secondary">{apt.type}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={apt.status} size="small" color={apt.statusColor as any} />
                              <Button size="small" onClick={() => handleOpenModal(apt, occurrence)}>Ver</Button>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Container>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogContent dividers>
          {selectedAppointment ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">Paciente</Typography>
              <Typography variant="body1">{selectedAppointment.patient}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Horário</Typography>
              <Typography variant="body1">{selectedAppointment.time}</Typography>

              {selectedOccurrenceDate && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">Data</Typography>
                  <Typography variant="body1">{selectedOccurrenceDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</Typography>
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
              <Typography variant="body1">{selectedAppointment.type}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Categoria</Typography>
              <Typography variant="body1">{selectedAppointment.category}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Tags</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedAppointment.tags.map((t) => (
                  <Chip key={t} label={t} size="small" />
                ))}
              </Stack>

              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip label={selectedAppointment.status} color={selectedAppointment.statusColor as any} size="small" />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button
            onClick={() => selectedAppointment && handleDeleteConsulta(selectedAppointment.id)}
            color="error"
            startIcon={<Delete />}
            size="small"
          >
            Excluir
          </Button>
          <Button
            onClick={() => selectedAppointment && handleOpenEditModal(selectedAppointment)}
            variant="outlined"
            startIcon={<Edit />}
            size="small"
          >
            Editar
          </Button>
          <Button onClick={handleCloseModal} size="small" sx={{ ml: 'auto' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreatePatientModal}
        onClose={() => setOpenCreatePatientModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Criar Paciente</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <CreatePatientForm onSuccess={handlePatientCreated} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenCreatePatientModal(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <CreateAppointmentModal 
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => {
          loadConsultas(); // Recarrega a lista após criar
          setOpenCreateModal(false);
        }}
      />

      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Editar Consulta</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3.5} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Paciente</InputLabel>
              <Select
                value={editConsulta.paciente_id || ''}
                onChange={(e) => setEditConsulta({ ...editConsulta, paciente_id: e.target.value })}
                label="Paciente"
              >
                {pacientes.map((patient) => (
                  <MenuItem key={patient.id} value={String(patient.id)}>{patient.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Data e Horário"
              type="datetime-local"
              value={editConsulta.horario}
              onChange={(e) => setEditConsulta({ ...editConsulta, horario: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Tipo"
              value={editConsulta.tipo}
              onChange={(e) => setEditConsulta({ ...editConsulta, tipo: e.target.value })}
              fullWidth
            />

            <TextField
              label="Categoria"
              value={editConsulta.categoria}
              onChange={(e) => setEditConsulta({ ...editConsulta, categoria: e.target.value })}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>Tags</Typography>
              {editConsulta.tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  {editConsulta.tags.map((tag) => (
                    <Chip key={tag} label={tag} onDelete={() => removeEditTag(tag)} />
                  ))}
                </Stack>
              )}
              <Stack direction="row" spacing={1.5}>
                <TextField
                  placeholder="Adicionar tag"
                  value={editConsulta.tagInput}
                  onChange={(e) => setEditConsulta({ ...editConsulta, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditTag())}
                  fullWidth
                />
                <Button onClick={addEditTag} variant="outlined">Adicionar</Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenEditModal(false)} disabled={editLoading}>Cancelar</Button>
          <Button onClick={handleUpdateConsulta} variant="contained" disabled={editLoading}>
            {editLoading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Agenda;