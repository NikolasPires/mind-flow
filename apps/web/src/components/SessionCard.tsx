// src/components/SessionCard.tsx
import styles from '../styles/PacienteDetalhes.module.css'; // Usa o mesmo CSS da página principal

interface SessionCardProps {
  date: string;
  type: string;
  notes?: string | null;
  statusLabel: string;
  statusVariant?: 'Concluida' | 'Confirmado' | 'AConfirmar' | 'Cancelado';
  onViewProntuario: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  date,
  type,
  notes,
  statusLabel,
  statusVariant,
  onViewProntuario,
}) => {
  const statusClassName = `${styles.sessionStatus} ${
    statusVariant ? styles[`status${statusVariant}`] || '' : ''
  }`;

  return (
    <div className={styles.sessionCard}>
      <div className={styles.sessionInfo}>
        <p className={styles.sessionDate}>{date}</p>
        <p className={styles.sessionType}>{type}</p>
        {notes && <p className={styles.sessionNotesPreview}>{notes}</p>}
      </div>
      <div className={styles.sessionActions}>
        <span className={statusClassName}>{statusLabel}</span>
        <button className={styles.viewProntuarioButton} onClick={onViewProntuario}>
          Ver Sessão
        </button>
      </div>
    </div>
  );
};

export default SessionCard;