import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown'; // Importação adicionada
import { FiCpu, FiFileText, FiChevronsLeft } from 'react-icons/fi';

import styles from '../../../../styles/ProntuarioSessao.module.css';
import { pacienteService, PacienteDetails, ConsultaResumo } from '@/services/pacienteService';

const statusLabelMap: Record<ConsultaResumo['status'], string> = {
  CONCLUIDA: 'Concluída',
  CONFIRMADO: 'Confirmada',
  A_CONFIRMAR: 'A Confirmar',
  CANCELADO: 'Cancelada',
};

const SessionRecordPage: React.FC = () => {
  const router = useRouter();
  const { patientId, sessionId } = router.query;
  const { data: session } = useSession();

  const [patient, setPatient] = useState<PacienteDetails | null>(null);
  const [consulta, setConsulta] = useState<ConsultaResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !session || !patientId || !sessionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = (session as any).accessToken;
        const patientData = await pacienteService.getPacienteById(patientId as string, token);
        setPatient(patientData);

        const foundSession = patientData.consultas?.find((item) => item.id === sessionId);
        setConsulta(foundSession || null);

        if (!foundSession) {
          setError('Sessão não encontrada.');
        }
      } catch (err: any) {
        console.error('Erro ao carregar prontuário:', err);
        setError(err.message || 'Não foi possível carregar esta sessão.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, session, patientId, sessionId]);

  if (loading) {
    return <main className={styles.mainContent}><p>Carregando sessão...</p></main>;
  }

  if (error || !patient || !consulta) {
    return (
      <main className={styles.mainContent}>
        <p>{error || 'Sessão não encontrada.'}</p>
        <button className={styles.btn} onClick={() => router.push(`/pacientes/${patientId}`)}>
          <FiChevronsLeft /> Voltar para o paciente
        </button>
      </main>
    );
  }

  const formattedDate = new Date(consulta.horario).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <main className={styles.mainContent}>
      <div className={styles.breadcrumb}>
        <Link href="/pacientes">Pacientes</Link> &gt;{' '}
        <Link href={`/pacientes/${patientId}`}>{patient.user?.name || 'Paciente'}</Link> &gt;{' '}
        Sessão de {formattedDate}
      </div>

      <div className={styles.header}>
        <h1>Prontuário da Sessão</h1>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => router.push(`/pacientes/${patientId}`)}>
            <FiChevronsLeft /> Voltar
          </button>
        </div>
      </div>

      <div className={styles.metadataCard}>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Data da Sessão</span>
          <span className={styles.metadataValue}>{formattedDate}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Tipo</span>
          <span className={styles.metadataValue}>{consulta.tipo}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Status</span>
          <span className={styles.metadataValue}>{statusLabelMap[consulta.status]}</span>
        </div>
      </div>

      <div className={styles.contentLayout}>
        <div className={styles.noteColumn}>
          <div className={styles.soapSection}>
            <h3><FiFileText /> Anotações Gerais</h3>
            <p>{consulta.anotacoes || 'Nenhuma anotação clínica foi registrada para esta sessão.'}</p>
          </div>

          <div className={styles.soapSection}>
            <h3><FiFileText /> Transcrição</h3>
            <p>{consulta.transcricao || 'Não há transcrição disponível.'}</p>
          </div>
        </div>

        {/* --- ATUALIZAÇÃO AQUI --- */}
        <aside className={styles.aiPanel}>
          <h3><FiCpu /> Sugestão da Malu</h3>
          <div className={styles.markdownContent}>
            {consulta.sugestao_IA ? (
              <ReactMarkdown>{consulta.sugestao_IA}</ReactMarkdown>
            ) : (
              <p className={styles.emptyText}>Nenhuma sugestão foi gerada para esta sessão.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default SessionRecordPage;