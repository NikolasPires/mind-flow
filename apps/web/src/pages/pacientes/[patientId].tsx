import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiPlayCircle } from 'react-icons/fi';

import Header from '@/components/Header';
import SessionCard from '@/components/SessionCard';
import Layout from '@/components/Layout';

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

  const [patient, setPatient] = useState<PacienteDetails | null>(null);
  const [activeTab, setActiveTab] = useState('HistoricoDeSessoes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_AVATAR = "/userDefault.svg";

  useEffect(() => {
    if (!router.isReady || !session || !patientId) return;

    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = (session as any).accessToken;

        const data = await pacienteService.getPacienteById(
          patientId as string,
          token
        );
console.log("Paciente retornado do backend:", data);

        setPatient(data);
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
    };

    fetchPatientDetails();
  }, [router.isReady, session, patientId]);

  if (loading) {
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

  return (
    <div className={styles.patientDetailsPage}>
      <Header title="Detalhes do Paciente" />

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
            Última sessão: {patient.last_session || "—"}
          </p>
        </div>

        <div className={styles.summaryActions}>
          <button className={styles.editButton}>Editar Dados</button>
          <button className={styles.scheduleButton}>+ Agendar Nova Sessão</button>

          <Link
            href={`/pacientes/${patientId}/sessoes/live`}
            className={styles.startButton}
          >
            <FiPlayCircle />
            Iniciar Sessão
          </Link>
        </div>
      </div>

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
            <p><strong>Telefone:</strong> {patient.user?.phone || "—"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetailsPage;
