import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import { useSession } from 'next-auth/react';

import styles from '@/styles/SessaoAtiva.module.css';
import {
  FiPlayCircle,
  FiPauseCircle,
  FiCheckSquare,
  FiMic,
  FiChevronsLeft,
  FiSquare,
  FiEdit2,
  FiFileText,
} from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';

import { pacienteService } from '@/services/pacienteService';
import { consultaService } from '@/services/consultaService';

type SessionState = 'INACTIVE' | 'ACTIVE' | 'PAUSED' | 'REVIEW';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;
};

const getPatientCacheKey = (id: string) => `mindflow:patient:${id}`;

const LiveSessionPage: React.FC = () => {
  const router = useRouter();
  const { patientId } = router.query;
  const { data: session } = useSession();

  const [patient, setPatient] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [sessionState, setSessionState] = useState<SessionState>('INACTIVE');
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [notes, setNotes] = useState('');

  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isSavingSession, setIsSavingSession] = useState(false);

  const recognitionRef = useRef<any>(null);
  const DEFAULT_AVATAR = '/userDefault.svg';

  // Preenche o estado com o paciente que já foi carregado em patientId.tsx (sessionStorage)
  useEffect(() => {
    if (!patientId || patient || typeof window === 'undefined') return;
    const cached = window.sessionStorage.getItem(getPatientCacheKey(String(patientId)));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setPatient(parsed);
        setLoadingPatient(false);
      } catch (err) {
        console.warn('Não foi possível ler o cache do paciente:', err);
      }
    }
  }, [patientId, patient]);

  // Busca dados atualizados do paciente no backend
  useEffect(() => {
    if (!router.isReady || !session || !patientId) return;

    const fetchPatientData = async () => {
      try {
        const token = (session as any)?.accessToken;
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        const data = await pacienteService.getPacienteById(patientId as string, token);
        setPatient(data);

        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem(
              getPatientCacheKey(String(patientId)),
              JSON.stringify(data)
            );
          } catch (err) {
            console.warn('Não foi possível salvar o paciente no cache:', err);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar paciente na sessão:', err);
        alert('Erro ao carregar dados do paciente.');
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientData();
  }, [router.isReady, session, patientId]);

  useEffect(() => {
    let interval: number | null = null;
    if (sessionState === 'ACTIVE') {
      interval = window.setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    }
    return () => {
      if (interval !== null) window.clearInterval(interval);
    };
  }, [sessionState]);

  const stopAndMergeRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setFinalTranscript((prev) => (prev + ' ' + interimTranscript).trim());
      setInterimTranscript('');
    }
  };

  const handleStartSession = () => setSessionState('ACTIVE');
  const handlePauseSession = () => {
    stopAndMergeRecording();
    setSessionState('PAUSED');
  };
  const handleResumeSession = () => setSessionState('ACTIVE');
  const handleGoToReview = () => {
    stopAndMergeRecording();
    setSessionState('REVIEW');
  };

  const handleToggleRecording = () => {
    if (sessionState !== 'ACTIVE') return;

    if (!consentGiven) {
      alert('É necessário marcar o consentimento do paciente para iniciar a gravação.');
      return;
    }

    if (!isRecording) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Reconhecimento de voz não é suportado neste navegador.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const chunk = result[0]?.transcript || '';
          if (result.isFinal) finalText += chunk.trim() + ' ';
          else interim += chunk;
        }
        if (finalText) setFinalTranscript((prev) => (prev + ' ' + finalText).trim());
        setInterimTranscript(interim);
      };

      recognition.onerror = console.error;
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      return;
    }

    stopAndMergeRecording();
  };

  const handleGenerateSuggestion = async () => {
    if (notes.trim().length === 0 && finalTranscript.trim().length === 0) {
      alert('Por favor, escreva anotações ou tenha transcrição para gerar sugestões.');
      return;
    }

    setIsLoadingSuggestion(true);
    setAiSuggestion('');

    try {
      const response = await fetch('/api/generate-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: finalTranscript,
          notes,
        }),
      });

      const data = await response.json();
      setAiSuggestion(data.suggestion || 'Nenhuma sugestão retornada.');
    } catch (err) {
      console.error(err);
      setAiSuggestion('Erro ao conectar com a IA. Verifique se a API está rodando.');
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleFinalizeAndSave = async () => {
    if (notes.trim().length === 0) {
      alert('Adicione anotações antes de finalizar.');
      return;
    }

    if (!session) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    if (!patientId) {
      alert('Paciente inválido.');
      return;
    }

    try {
      setIsSavingSession(true);
      const token = (session as any)?.accessToken;
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }

      const endTime = new Date();
      const startTimestamp = timeElapsed > 0 ? endTime.getTime() - timeElapsed * 1000 : endTime.getTime();
      const horario = new Date(startTimestamp).toISOString();

      await consultaService.createConsulta(
        {
          paciente_id: String(patientId),
          horario,
          tipo: 'Sessão Terapêutica',
          categoria: 'Live',
          tags: ['live-session'],
          status: 'CONCLUIDA',
          anotacoes: notes,
          transcricao: finalTranscript || undefined,
          sugestao_IA: aiSuggestion || undefined,
        },
        token
      );

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(getPatientCacheKey(String(patientId)));
      }

      alert('Sessão finalizada e salva!');
      router.push(`/pacientes/${patientId}`);
    } catch (error: any) {
      console.error('Erro ao salvar sessão:', error);
      alert(error?.message || 'Erro ao salvar sessão. Tente novamente.');
    } finally {
      setIsSavingSession(false);
    }
  };

  if (loadingPatient) {
    return <div className={styles.centeredMessage}>Carregando dados da sessão...</div>;
  }

  if (!patient) {
    return <div className={styles.centeredMessage}>Paciente não encontrado.</div>;
  }

  const displayableTranscript = (
    finalTranscript +
    ' ' +
    (isRecording ? interimTranscript : '')
  ).trim();

  const isSessionInactive = sessionState === 'INACTIVE';
  const isSessionActive = sessionState === 'ACTIVE';
  const isNotesEditable = sessionState !== 'INACTIVE';

  return (
    <>
      <Head>
        <title>Sessão Ativa - {patient.user?.name}</title>
      </Head>

      <div className={styles.sessionPage}>
        <aside className={styles.sidebar}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <FiChevronsLeft /> Voltar
          </button>

          <img
            src={patient.user?.photo_url || DEFAULT_AVATAR}
            alt={`Avatar de ${patient.user?.name}`}
            className={styles.patientAvatar}
            onError={(e) => ((e.target as HTMLImageElement).src = DEFAULT_AVATAR)}
          />

          <h2>{patient.user?.name}</h2>

          <div className={styles.sessionInfo}>
            <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Duração:</strong> {formatTime(timeElapsed)}</p>
            <p><strong>Status:</strong> <span className={styles.statusText}>{sessionState}</span></p>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.controlsBar}>
            {!isSessionInactive && (
              <div className={styles.timerDisplay}>{formatTime(timeElapsed)}</div>
            )}

            {isSessionActive && (
              <div className={styles.recordingControls}>
                <div className={styles.consent}>
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                  />
                  <label>Gravação consentida</label>
                </div>

                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={!consentGiven}
                  className={`${styles.recordButton} ${isRecording ? styles.recordingActive : ''}`}
                >
                  <FiMic /> {isRecording ? 'Parar' : 'Gravar'}
                </button>
              </div>
            )}

            <div className={styles.actionButtons}>
              {isSessionInactive && (
                <button type="button" onClick={handleStartSession} className={styles.sessionButtonStart}>
                  <FiPlayCircle /> Iniciar
                </button>
              )}

              {isSessionActive && (
                <>
                  <button type="button" onClick={handlePauseSession} className={styles.sessionButtonPause}>
                    <FiPauseCircle /> Pausar
                  </button>
                  <button type="button" onClick={handleGoToReview} className={styles.sessionButtonEnd}>
                    <FiSquare /> Encerrar
                  </button>
                </>
              )}

              {sessionState === 'PAUSED' && (
                <>
                  <button type="button" onClick={handleResumeSession} className={styles.sessionButtonStart}>
                    <FiPlayCircle /> Retomar
                  </button>
                  <button type="button" onClick={handleGoToReview} className={styles.sessionButtonFinalize}>
                    <FiCheckSquare /> Revisar
                  </button>
                </>
              )}

              {sessionState === 'REVIEW' && (
                <button
                  type="button"
                  onClick={handleFinalizeAndSave}
                  className={styles.sessionButtonFinalize}
                  disabled={isSavingSession}
                >
                  <FiCheckSquare /> {isSavingSession ? 'Salvando...' : 'Salvar e Sair'}
                </button>
              )}
            </div>
          </div>

          <h3 className={styles.sectionTitle}>
            <FiEdit2 /> Anotações Clínicas
          </h3>

          <div className={styles.notesArea}>
            <textarea
              placeholder="Digite suas anotações aqui..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isNotesEditable}
            />
          </div>

          <h3 className={styles.sectionTitle}>
            <FiFileText /> Transcrição
          </h3>

          <textarea
            className={styles.transcriptionEditable}
            value={displayableTranscript}
            onChange={(e) => setFinalTranscript(e.target.value)}
            disabled={!isNotesEditable || isRecording}
            placeholder="O texto transcrito aparecerá aqui..."
          />

          <h3 className={styles.sectionTitle}>
            <IoSparkles /> Sugestão da Malu
          </h3>

          <div className={styles.aiArea}>
            <button
              type="button"
              className={styles.aiButton}
              onClick={handleGenerateSuggestion}
              disabled={!isNotesEditable || isLoadingSuggestion}
            >
              <IoSparkles />
              {isLoadingSuggestion ? 'A Malu está analisando...' : 'Pedir ajuda à Malu'}
            </button>

            <div className={styles.aiSuggestionCard}>
              {isLoadingSuggestion ? (
                <span className={styles.loadingText}>
                  <IoSparkles /> A Malu está analisando a sessão...
                </span>
              ) : aiSuggestion ? (
                <ReactMarkdown>{aiSuggestion}</ReactMarkdown>
              ) : (
                <span className={styles.aiPlaceholder}>
                  Os insights gerados pela Malu aparecerão aqui após clicar no botão.
                </span>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default LiveSessionPage;