import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { consultaService } from '../services/consultaService';
import { pacienteService, Paciente } from '../services/pacienteService';

// Importe o novo CSS Module
import styles from '../styles/CreateAppointmentModal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedPatientId?: string;
}

const CreateAppointmentModal: React.FC<Props> = ({ open, onClose, onSuccess, preSelectedPatientId }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  
  const [newConsulta, setNewConsulta] = useState({
    paciente_id: '',
    horario: '',
    tipo: '',
    categoria: '',
    tags: [] as string[],
    tagInput: '',
  });

  useEffect(() => {
    if (open && session?.accessToken) {
      loadPacientes();
      if (preSelectedPatientId) {
        setNewConsulta(prev => ({ ...prev, paciente_id: preSelectedPatientId }));
      }
    }
  }, [open, session, preSelectedPatientId]);

  const loadPacientes = async () => {
    try {
      const data = await pacienteService.listPacientes(session?.accessToken as string);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes no modal', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregamento padrão do form
    try {
      setLoading(true);
      setError(null);

      if (!newConsulta.paciente_id || !newConsulta.horario || !newConsulta.tipo || !newConsulta.categoria) {
        setError('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      await consultaService.createConsulta({
        paciente_id: newConsulta.paciente_id,
        horario: newConsulta.horario,
        tipo: newConsulta.tipo,
        categoria: newConsulta.categoria,
        tags: newConsulta.tags,
      }, session?.accessToken as string);

      setNewConsulta({ paciente_id: '', horario: '', tipo: '', categoria: '', tags: [], tagInput: '' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar consulta');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault(); // Evita submit do form ao dar Enter na tag
    if (newConsulta.tagInput.trim() && !newConsulta.tags.includes(newConsulta.tagInput.trim())) {
      setNewConsulta({
        ...newConsulta,
        tags: [...newConsulta.tags, newConsulta.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setNewConsulta({ ...newConsulta, tags: newConsulta.tags.filter(t => t !== tag) });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      // Remove padding padrão do Dialog para usarmos o nosso
      PaperProps={{
        style: { borderRadius: '12px' }
      }}
    >
      <DialogContent className={styles.container}>
        <h2 className={styles.title}>Agendar Nova Sessão</h2>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleCreate} className={styles.form}>
          
          <div className={styles.formGroup}>
            <label htmlFor="paciente">Paciente</label>
            <select
              id="paciente"
              value={newConsulta.paciente_id}
              onChange={(e) => setNewConsulta({ ...newConsulta, paciente_id: e.target.value })}
              disabled={!!preSelectedPatientId || loading}
              required
            >
              <option value="" disabled>Selecione um paciente...</option>
              {pacientes.map((p) => (
                <option key={p.userId} value={String(p.userId)}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="horario">Data e Horário</label>
              <input
                id="horario"
                type="datetime-local"
                value={newConsulta.horario}
                onChange={(e) => setNewConsulta({ ...newConsulta, horario: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="tipo">Tipo</label>
              <input
                id="tipo"
                type="text"
                placeholder="Ex: Terapia Online"
                value={newConsulta.tipo}
                onChange={(e) => setNewConsulta({ ...newConsulta, tipo: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="categoria">Categoria</label>
              <input
                id="categoria"
                type="text"
                placeholder="Ex: Acompanhamento"
                value={newConsulta.categoria}
                onChange={(e) => setNewConsulta({ ...newConsulta, categoria: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Tags</label>
            
            {/* Lista de tags adicionadas */}
            {newConsulta.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {newConsulta.tags.map((tag) => (
                  <div key={tag} className={styles.tagChip}>
                    {tag}
                    <span 
                      className={styles.removeTag} 
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Input para nova tag */}
            <div className={styles.tagInputGroup}>
              <input
                type="text"
                placeholder="Nova tag"
                value={newConsulta.tagInput}
                onChange={(e) => setNewConsulta({ ...newConsulta, tagInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
              />
              <button 
                type="button" 
                className={styles.addButton} 
                onClick={addTag}
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Agendar Sessão'}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentModal;