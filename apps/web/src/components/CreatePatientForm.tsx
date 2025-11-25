import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '../styles/CreatePatientForm.module.css';
import { pacienteService } from '../services/pacienteService';

type Props = {
  onSuccess?: () => void;
};

const CreatePatientForm: React.FC<Props> = ({ onSuccess }) => {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert('Você não está autenticado. Faça login novamente.');
      return;
    }

    try {
      setLoading(true);

      const token = (session as any)?.accessToken;
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }

      const cpfDigits = cpf.replace(/\D/g, '');
      const password = cpfDigits.substring(0, 6);

      const genderMap: Record<string, 'MASCULINO' | 'FEMININO' | 'OUTRO'> = {
        masculino: 'MASCULINO',
        feminino: 'FEMININO',
        outro: 'OUTRO',
        'nao-informar': 'OUTRO'
      };

      // --- ALTERAÇÃO AQUI: Chave 'phone' em vez de 'telefone' ---
      const payload = {
        name,
        email,
        password,
        cpf: cpfDigits,
        gender: genderMap[gender],
        phone: phone, 
      };

      await pacienteService.createPaciente(payload, token);

      alert('Paciente cadastrado com sucesso!');

      setName('');
      setEmail('');
      setPhone('');
      setCpf('');
      setGender('');

      if (onSuccess) onSuccess(); 

    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      alert(error.message || 'Erro ao cadastrar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h2>Novo Paciente</h2>
      <p className={styles.subtitle}>Preencha as informações abaixo para cadastrar</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            type="text"
            placeholder="Digite o nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender">Gênero</label>
            <select
              id="gender"
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
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Paciente'}
        </button>
      </form>
    </div>
  );
};

export default CreatePatientForm;