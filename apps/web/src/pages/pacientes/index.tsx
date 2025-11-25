// src/pages/pacientes/index.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '../../components/Header';
import styles from '../../styles/ListaPacientes.module.css';
import { FiPlus } from 'react-icons/fi';
import { NextPageWithAuth } from '@/types/page-auth';
import Modal from '../../components/Modal';
import CreatePatientForm from '../../components/CreatePatientForm';
import { pacienteService, Paciente } from '../../services/pacienteService';

const PatientsListPage: NextPageWithAuth = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 const DEFAULT_AVATAR = '/userDefault.svg';


  const fetchPatients = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      const token = (session as any)?.accessToken;

      const data = await pacienteService.listPacientes(token);
      setPatients(data);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar pacientes");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [session]);

  const handleModalClose = () => {
    setShowModal(false);
    fetchPatients(); // atualiza lista após criar paciente
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.patientsListPage}>
      <Header title="Meus Pacientes" />

      <div className={styles.actionsContainer}>
        <input
          type="text"
          placeholder="Pesquisar pacientes..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          onClick={() => setShowModal(true)}
          className={styles.newPatientButton}
        >
          <FiPlus className={styles.buttonIcon} />
          <span>Adicionar Novo Paciente</span>
        </button>
      </div>

      {loading && <div className={styles.noResults}>Carregando pacientes...</div>}

      {!loading && error && (
        <div className={styles.noResults} style={{ color: '#d32f2f' }}>
          Erro: {error}
        </div>
      )}

      {!loading && !error && (
        <div className={styles.patientList}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Link
                key={patient.id}
                href={`/pacientes/${patient.id}`}
                className={styles.patientCard}
              >
                <img
                  src={patient.photo_url || DEFAULT_AVATAR}
                  alt={patient.name}
                  className={styles.patientAvatar}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = DEFAULT_AVATAR)
                  }
                />
                <div className={styles.patientInfo}>
                  <h3>{patient.name}</h3>
                  <p>Status: {patient.status || 'N/A'}</p>
                  <p>Email: {patient.email || 'N/A'}</p>
                </div>
                <span className={styles.arrowIcon}>→</span>
              </Link>
            ))
          ) : (
            <p className={styles.noResults}>
              {searchTerm
                ? `Nenhum paciente encontrado com "${searchTerm}".`
                : "Nenhum paciente cadastrado ainda."}
            </p>
          )}
        </div>
      )}

     <Modal isOpen={showModal} onClose={handleModalClose}>
        <CreatePatientForm onSuccess={handleModalClose} />
      </Modal>
    </div>
  );
};

PatientsListPage.auth = {
  isProtected: true,
};

export default PatientsListPage;
