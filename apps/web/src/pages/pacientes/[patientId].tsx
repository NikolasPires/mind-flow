import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiPlayCircle } from 'react-icons/fi';

// Componentes da Interface
import Header from '@/components/Header';
import SessionCard from '@/components/SessionCard';
import Layout from '@/components/Layout';

// Modais Reutilizáveis
import CreateAppointmentModal from '@/components/CreateAppointmentModal';
import EditPatientModal from '@/components/EditPatientModal';

import styles from '@/styles/PacienteDetalhes.module.css';

import { pacienteService } from '@/services/pacienteService';
import type { PacienteDetails, ConsultaResumo } from '@/services/pacienteService';

const getPatientCacheKey = (id: string) => `mindflow:patient:${id}`;

const statusLabelMap: Record<ConsultaResumo['status'], string> = {
  CONCLUIDA: 'Concluída',
  CONFIRMADO: 'Confirmada',
  A_CONFIRMAR: 'A Confirmar',
  CANCELADO: 'Cancelada',
};

const statusVariantMap: Record<ConsultaResumo['status'], 'Concluida' | 'Confirmado' | 'AConfirmar' | 'Cancelado'> = {
  CONCLUIDA: 'Concluida',
  CONFIRMADO: 'Confirmado',
  A_CONFIRMAR: 'AConfirmar',
  CANCELADO: 'Cancelado',
};

const PatientDetailsPage: React.FC = () => {
  const router = useRouter();
  const { patientId } = router.query;
  const { data: session } = useSession();

  // Estados de Dados e UI
  const [patient, setPatient] = useState<PacienteDetails | null>(null);
  const [activeTab, setActiveTab] = useState('HistoricoDeSessoes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados dos Modais
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const DEFAULT_AVATAR = "/userDefault.svg";
  
  const formatPhoneNumber = (phone: string | null | undefined) => {
        if (!phone) return "—";
        
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 11) {
          return cleaned.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
        }

        if (cleaned.length === 10) {
          return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        }

        return phone;
      };

  // --- FUNÇÃO DE BUSCA CORRIGIDA (SEM LOOP INFINITO) ---
  const fetchPatientDetails = useCallback(async () => {
    if (!session || !patientId) return;

    try {
      // Só ativa o loading full screen se ainda não tivermos dados na tela
      // Isso evita que a tela "pisque" quando você edita e salva.
      setLoading((prev) => !patient ? true : prev); 
      setError(null);

      const token = (session as any).accessToken;

      const data = await pacienteService.getPacienteById(
        patientId as string,
        token
      );
      console.log("Dados do paciente atualizados:", data);

      setPatient(data);

      
      
      // Atualiza Cache
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(
            getPatientCacheKey(String(patientId)),
            JSON.stringify(data)
          );
        } catch (err) {
          console.warn('Não foi possível salvar paciente em cache:', err);
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar paciente");
    } finally {
      setLoading(false);
    }
  }, [session, patientId]); // <--- IMPORTANTE: 'patient' REMOVIDO DAQUI

  // Carrega os dados na montagem do componente
  useEffect(() => {
    if (router.isReady && session && patientId) {
      fetchPatientDetails();
    }
  }, [router.isReady, session, patientId, fetchPatientDetails]);

  // Renderização de Loading/Erro
  if (loading && !patient) {
    return (
      <Layout>
        <div className={styles.centeredMessage}>Carregando paciente...</div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className={styles.centeredMessage}>
          {error || "Paciente não encontrado."}
        </div>
      </Layout>
    );
  }

  // Lógica para calcular a última sessão concluída dinamicamente
  const lastCompletedSession = patient.consultas?.find(
    (c) => c.status === 'CONCLUIDA'
  );

  const lastSessionDate = lastCompletedSession
    ? new Date(lastCompletedSession.horario).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className={styles.patientDetailsPage}>
      <Header title="Detalhes do Paciente" />

      {/* --- Resumo do Paciente (Topo) --- */}
      <div className={styles.patientSummary}>
        <img
          src={patient.user?.photo_url || DEFAULT_AVATAR}
          alt={patient.user?.name}
          className={styles.patientAvatar}
          onError={(e) => ((e.target as HTMLImageElement).src = DEFAULT_AVATAR)}
        />

        <div className={styles.patientInfo}>
          <h2 className={styles.patientName}>{patient.user?.name}</h2>
          <p className={styles.lastSession}>
            Última sessão: {lastSessionDate || "—"}
          </p>
        </div>

        <div className={styles.summaryActions}>
          {/* Botão Editar */}
          <button 
            className={styles.editButton}
            onClick={() => setIsEditModalOpen(true)}
          >
            Editar Dados
          </button>
          
          {/* Botão Agendar Sessão */}
          <button 
            className={styles.scheduleButton}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            + Agendar Nova Sessão
          </button>

          {/* Botão Iniciar Sessão Live */}
          <Link
            href={`/pacientes/${patientId}/sessoes/live`}
            className={styles.startButton}
          >
            <FiPlayCircle />
            Iniciar Sessão
          </Link>
        </div>
      </div>

      {/* --- Navegação de Abas --- */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tabItem} ${
            activeTab === "HistoricoDeSessoes" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("HistoricoDeSessoes")}
        >
          Histórico de Sessões
        </button>

        <button
          className={`${styles.tabItem} ${
            activeTab === "InformacoesPessoais" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("InformacoesPessoais")}
        >
          Informações Pessoais
        </button>
      </nav>

      {/* --- Conteúdo das Abas --- */}
      <div className={styles.tabContent}>
        {activeTab === "HistoricoDeSessoes" && (
          <div className={styles.sessionHistory}>
            {patient.consultas && patient.consultas.length > 0 ? (
              patient.consultas.map((consulta: ConsultaResumo) => {
                const formattedDate = new Date(consulta.horario).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                });

                return (
                  <SessionCard
                    key={consulta.id}
                    date={formattedDate}
                    type={consulta.tipo}
                    notes={consulta.anotacoes || consulta.transcricao || 'Sem observações registradas.'}
                    statusLabel={statusLabelMap[consulta.status]}
                    statusVariant={statusVariantMap[consulta.status]}
                    onViewProntuario={() =>
                      router.push(`/pacientes/${patientId}/sessoes/${consulta.id}`)
                    }
                  />
                );
              })
            ) : (
              <p>Nenhuma sessão cadastrada ainda.</p>
            )}
          </div>
        )}

        {activeTab === "InformacoesPessoais" && (
          <div className={styles.personalInfoSection}>
            <h3>Dados Pessoais</h3>
            <p><strong>Email:</strong> {patient.user?.email || "—"}</p>
            <p><strong>Telefone:</strong> {formatPhoneNumber(patient.user?.phone)}</p>
            <p>
              <strong>Gênero:</strong> {
                patient.gender 
                  ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase() 
                  : "—"
              }
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL DE AGENDAMENTO --- */}
      <CreateAppointmentModal 
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        preSelectedPatientId={patientId as string}
        onSuccess={() => {
           // Recarrega para mostrar a nova sessão na lista
           fetchPatientDetails();
        }}
      />

      {/* --- MODAL DE EDIÇÃO DE PACIENTE --- */}
      <EditPatientModal 
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onSuccess={() => {
          fetchPatientDetails();
        }}
      />
    </div>
  );
};

export default PatientDetailsPage;