import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Dashboard.module.css';
import { getSession } from 'next-auth/react';

interface Paciente {
  id: string;
  name: string;
  email?: string;
}

interface AgendaItem {
  id: string;
  horario: string;
  tipo?: string;
  categoria?: string;
  paciente: {
    user: {
      id: string;
      name: string;
      email?: string;
    };
  };
}

export default function DashboardPage() {
  const [pacientesRecentes, setPacientesRecentes] = useState<Paciente[]>([]);
  const [agendaHoje, setAgendaHoje] = useState<AgendaItem[]>([]);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  async function fetchDashboard() {
    setIsLoading(true);
    try {
      const session = await getSession();

      if (!session?.accessToken) {
        throw new Error('Usuário não autenticado');
      }
      const apiUrl = process.env.NEXT_PUBLIC_DB_HOST;
      const res = await fetch(`${apiUrl}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar dashboard: ${res.status} ${text}`);
      }

      const data = await res.json();
      setTodayCount(data.todayCount ?? 0);
      setAgendaHoje(data.todayAgenda ?? []);
      setPacientesRecentes(
        (data.recentPatients ?? []).map((p: any) => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
        })),
      );
    } catch (err: any) {
      setError(err.message ?? 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }

  fetchDashboard();
}, []);

  const renderPacientesCard = () => {
    if (isLoading) return <p>Carregando...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (pacientesRecentes.length === 0) return <p>Nenhum paciente encontrado.</p>;

    return (
      <ul className={styles.recentList}>
    {pacientesRecentes.map((p) => (
      <li key={p.id} className={styles.recentItem}>
        <div className={styles.recentAvatar}>
           {p.name.charAt(0)}
        </div>
        <div className={styles.recentDetails}>
          <span className={styles.recentName}>{p.name}</span>
          {p.email && <small className={styles.recentEmail}>{p.email}</small>}
        </div>
      </li>
    ))}
  </ul>
    );
  };

  const renderAgenda = () => {
    if (isLoading) return <p>Carregando agenda...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (agendaHoje.length === 0) return <p>Nenhuma sessão hoje.</p>;

    return (
      <ul className={styles.agendaList}>
        {agendaHoje.map((item) => (
          <li key={item.id} className={styles.agendaItem}>
            <div className={styles.agendaTime}>
              <strong>{new Date(item.horario).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>

            <div className={styles.agendaDetails}>
              <span className={styles.agendaPatientName}>
                {item.paciente?.user?.name && typeof item.paciente.user.name === 'string'
                    ? item.paciente.user.name : 'Paciente'}
              </span>
              {item.categoria && <span className={`${styles.tag} ${styles.tagPrimary}`}>{item.categoria}</span>}
              {item.tipo && <span className={`${styles.tag} ${styles.tagSecondary}`}>{item.tipo}</span>}
          </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <div className="greeting">
            <h1>Bem vindo de volta.</h1>
            <p>Você tem {todayCount ?? '...'} sessões agendadas para hoje.</p>
          </div>
        </header>

        <div className={styles.contentBody}>
          <section className={styles.agendaCard}>
            <h2>Sua Agenda do Dia</h2>
            {renderAgenda()}
          </section>

          <div className={styles.sideCards}>

            <section className={styles.infoCard}>
              <h3>Pacientes Recentes</h3>
              {renderPacientesCard()}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
