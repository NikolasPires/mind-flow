import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, Alert } from '@mui/material';
import { pacienteService, PacienteDetails } from '../services/pacienteService';

// Seu CSS novo e limpo
import styles from '../styles/EditPatientModal.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient: PacienteDetails | null;
};

const EditPatientModal: React.FC<Props> = ({ open, onClose, onSuccess, patient }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa com string vazia para o input não travar
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');

  // --- CORREÇÃO AQUI ---
  // Só executa quando a variável 'open' mudar.
  // Removemos 'patient' do array final [open] para evitar que ele resete enquanto você digita.
  useEffect(() => {
    if (open && patient && patient.user) {
      setName(patient.user.name || '');
      setEmail(patient.user.email || '');
      setPhone(patient.user.phone || '');
      
      const genderMapReverse: Record<string, string> = {
        'MASCULINO': 'masculino',
        'FEMININO': 'feminino',
        'OUTRO': 'outro'
      };
      setGender(genderMapReverse[patient.gender] || '');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !patient) return;

    try {
      setLoading(true);
      setError(null);
      const token = (session as any)?.accessToken;

      const genderMap: Record<string, 'MASCULINO' | 'FEMININO' | 'OUTRO'> = {
        masculino: 'MASCULINO',
        feminino: 'FEMININO',
        outro: 'OUTRO',
      };

      const payload = {
        name,
        email,
        phone,
        gender: genderMap[gender],
      };

      // Usa patient.id (conforme sua interface correta)
      await pacienteService.updatePaciente(patient.userId, payload, token);

      onSuccess(); 
      onClose();

    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      setError(error.message || 'Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: { borderRadius: '12px', overflow: 'hidden' }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Editar Paciente</h2>
            <p className={styles.subtitle}>Atualize as informações do cadastro</p>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="edit-name">Nome completo</label>
              <input
                id="edit-name"
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="edit-phone">Telefone</label>
                <input
                  id="edit-phone"
                  className={styles.input}
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="edit-gender">Gênero</label>
              <select
                id="edit-gender"
                className={styles.select}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="" disabled>Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.btnCancel} 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              
              <button 
                type="submit" 
                className={styles.btnSave}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientModal;