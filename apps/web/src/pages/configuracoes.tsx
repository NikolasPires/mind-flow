// src/pages/settings.tsx

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '@/styles/Configuracoes.module.css';
import { FiSave, FiUser, FiMail, FiPhone, FiCalendar, FiLock, FiInfo, FiUpload, FiCamera, FiCheckCircle } from 'react-icons/fi';
import { userService, UserProfile } from '../services/userService';

// --- Tipos de Dados (Expandidos para ambos os perfis) ---

type UserType = 'PATIENT' | 'PSYCHOLOGIST';

interface ProfileData {
    id: string;
    nome: string;
    data_de_nascimento?: string; 
    email: string;
    telefone: string | null;
    foto: string | null; 
    endereco?: string;
    login?: string;
    tipo_usuario: UserType;
    // Paciente fields
    cpf?: string | null;
    historico?: string | null;
    status?: string;
    genero?: string;
    observacoes_iniciais?: string | null;
    psicologo_responsavel_id?: string | null;
    // Psicologo fields
    crp?: string;
    bio?: string | null;
    configuracoes_agenda?: string;
}

// Função para converter UserProfile da API para ProfileData do componente
const convertApiProfileToProfileData = (apiProfile: UserProfile): ProfileData => {
    const isPatient = apiProfile.role === 'PACIENTE';
    
    const baseProfile: ProfileData = {
        id: apiProfile.id,
        nome: apiProfile.name,
        email: apiProfile.email,
        telefone: apiProfile.phone,
        foto: apiProfile.photo_url,
        tipo_usuario: isPatient ? 'PATIENT' : 'PSYCHOLOGIST',
    };

    if (isPatient && apiProfile.paciente) {
        return {
            ...baseProfile,
            cpf: apiProfile.paciente.cpf,
            historico: apiProfile.paciente.history,
            status: apiProfile.paciente.status,
            genero: apiProfile.paciente.gender,
            observacoes_iniciais: apiProfile.paciente.initial_observations,
        };
    }

    if (!isPatient && apiProfile.psicologo) {
        return {
            ...baseProfile,
            crp: apiProfile.psicologo.crp,
            bio: apiProfile.psicologo.bio,
            configuracoes_agenda: apiProfile.psicologo.schedule_settings 
                ? JSON.stringify(apiProfile.psicologo.schedule_settings)
                : undefined,
        };
    }

    return baseProfile;
};


// --- Componentes Reutilizáveis: FormField (Mantido) ---

interface FormFieldProps {
    label: string;
    name: string;
    icon: React.ElementType;
    value: string | number | undefined; // 'undefined' permitido
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    disabled?: boolean;
    isTextArea?: boolean;
    placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, name, icon: Icon, value, onChange, type = 'text', disabled = false, isTextArea = false, placeholder = '' }) => (
    <div className={styles.formGroup}>
        <label htmlFor={name} className={styles.label}>
            <Icon className={styles.icon} /> {label}
        </label>
        {isTextArea ? (
            <textarea
                id={name}
                name={name}
                value={value || ''} // Trata undefined
                onChange={onChange}
                disabled={disabled}
                rows={4}
                placeholder={placeholder}
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value || ''} // Trata undefined
                onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
                disabled={disabled}
                placeholder={placeholder}
            />
        )}
    </div>
);


// --- Componente: Modal de Alteração de Senha (Mantido) ---

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            alert('A nova senha e a confirmação não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
             alert('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        console.log('Alteração de senha enviada.');

        setIsSubmitting(false);
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => {
            onClose(); 
            setSuccess(false);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2>Alterar Senha de Acesso</h2>
                
                {success ? (
                    <div className={styles.successMessage}>
                        <FiCheckCircle className={styles.successIcon} />
                        <p>Sua senha foi alterada com sucesso!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FormField 
                            label="Senha Atual" 
                            name="current_password" 
                            icon={FiLock} 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            type="password"
                        />
                        <FormField 
                            label="Nova Senha" 
                            name="new_password" 
                            icon={FiLock} 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            type="password"
                        />
                        <FormField 
                            label="Confirmar Nova Senha" 
                            name="confirm_password" 
                            icon={FiLock} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            type="password"
                        />
                        <div className={styles.modalButtonContainer}>
                            <button type="submit" className={styles.saveButton} disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}>
                                {isSubmitting ? 'Verificando...' : 'Confirmar Alteração'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Componente Principal: SettingsPage (DINÂMICO) ---

const SettingsPage: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || !session.accessToken) {
            router.push('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const apiProfile = await userService.getProfile(session.accessToken as string);
                const convertedProfile = convertApiProfileToProfileData(apiProfile);
                setProfile(convertedProfile);
            } catch (err: any) {
                console.error('Erro ao carregar perfil:', err);
                setError(err.message || 'Erro ao carregar perfil do usuário');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [session, status, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile!,
            [name]: value,
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfile((prevProfile) => ({
                    ...prevProfile!,
                    foto: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !session?.accessToken) return;

        setIsSaving(true);
        setError(null);

        try {
            const isPatient = profile.tipo_usuario === 'PATIENT';
            
            // Preparar payload para atualização
            const updateData: any = {
                name: profile.nome,
                email: profile.email,
                phone: profile.telefone || undefined,
                photo_url: profile.foto || undefined,
            };

            // Campos específicos do psicólogo
            if (!isPatient) {
                if (profile.bio !== undefined) {
                    updateData.bio = profile.bio;
                }
                if (profile.configuracoes_agenda) {
                    try {
                        updateData.schedule_settings = JSON.parse(profile.configuracoes_agenda);
                    } catch {
                        updateData.schedule_settings = profile.configuracoes_agenda;
                    }
                }
            }

            const result = await userService.updateProfile(updateData, session.accessToken);
            
            // Atualizar perfil local com resposta da API
            if (result.user) {
                const apiProfile: UserProfile = {
                    ...result.user,
                    role: profile.tipo_usuario === 'PATIENT' ? 'PACIENTE' : 'PSICOLOGO',
                } as UserProfile;
                const updatedProfile = convertApiProfileToProfileData(apiProfile);
                setProfile(updatedProfile);
            }

            alert('Configurações salvas com sucesso!');
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            setError(err.message || 'Erro ao salvar configurações');
            alert(err.message || 'Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return <div className={styles.centeredMessage}>Carregando perfil...</div>;
    }

    if (error) {
        return <div className={styles.centeredMessage}>Erro: {error}</div>;
    }

    if (!profile) {
        return <div className={styles.centeredMessage}>Erro ao carregar perfil.</div>;
    }
    
    const isPatient = profile.tipo_usuario === 'PATIENT';
    const birthDateInput = profile.data_de_nascimento ? profile.data_de_nascimento.substring(0, 10) : '';
    const pageTitle = isPatient ? 'Configurações do Paciente' : 'Configurações do Psicólogo';

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
            </Head>
            <div className={styles.settingsPage}>
                <header className={styles.header}>
                    <h1>{pageTitle}</h1>
                    <p>Atualize suas informações pessoais e específicas de perfil.</p>
                </header>

                <form onSubmit={handleSave} className={styles.profileForm}>
                    {/* Seção de Foto - COMUM A AMBOS */}
                    <h2 className={styles.sectionTitle}>
                        <FiCamera /> Imagem de Perfil
                    </h2>
                    <div className={styles.photoUploadContainer}>
                        <img 
                            src={
                                profile.foto && !profile.foto.startsWith('data:') 
                                    ? profile.foto.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face,f_auto,q_auto/') 
                                    : (profile.foto || '/default-avatar.png')
                            } 
                            alt="Foto de Perfil" 
                            className={styles.profilePhoto}
                        />
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoChange} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                        />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className={styles.uploadButton}
                        >
                            <FiUpload /> Alterar Foto
                        </button>
                    </div>

                    {/* Informações Básicas (Usuário) - COMUM A AMBOS */}
                    <h2 className={styles.sectionTitle}>
                        <FiUser /> Dados Pessoais
                    </h2>
                    <div className={styles.grid}>
                        <FormField label="Nome Completo" name="nome" icon={FiUser} value={profile.nome || ''} onChange={handleChange} />
                        <FormField label="E-mail" name="email" icon={FiMail} value={profile.email || ''} onChange={handleChange} type="email" />
                        <FormField label="Telefone" name="telefone" icon={FiPhone} value={profile.telefone || ''} onChange={handleChange} />
                        {birthDateInput && (
                            <FormField label="Data de Nascimento" name="data_de_nascimento" icon={FiCalendar} value={birthDateInput} onChange={handleChange} type="date" />
                        )}
                    </div>
                    {profile.endereco && (
                        <FormField label="Endereço Completo" name="endereco" icon={FiInfo} value={profile.endereco} onChange={handleChange} />
                    )}
                    
                    {/* Seção de Acesso e Senha - COMUM A AMBOS */}
                    <h2 className={styles.sectionTitle}>
                        <FiLock /> Acesso e Segurança
                    </h2>
                    <div className={styles.grid}>
                        {profile.login && (
                            <FormField label="Login de Acesso" name="login" icon={FiUser} value={profile.login} onChange={handleChange} disabled={true} />
                        )}
                        <button type="button" className={styles.changePasswordButton} onClick={() => setIsModalOpen(true)}>
                            <FiLock /> Alterar Senha
                        </button>
                    </div>

                    {/* Campos Específicos do Perfil - DINÂMICO */}
                    <h2 className={styles.sectionTitle}>
                        <FiInfo /> {isPatient ? 'Informações de Registro (Paciente)' : 'Dados Profissionais (Psicólogo)'}
                    </h2>

                    <div className={styles.grid}>
                        {/* Lógica do Paciente */}
                        {isPatient && (
                            <>
                                <FormField label="CPF" name="cpf" icon={FiInfo} value={profile.cpf} onChange={handleChange} disabled={true} placeholder="Não editável" />
                                <FormField label="Gênero" name="genero" icon={FiInfo} value={profile.genero} onChange={handleChange} placeholder="Ex: Feminino, Masculino" />
                            </>
                        )}
                        {/* Lógica do Psicólogo */}
                        {!isPatient && (
                            <>
                                <FormField label="CRP" name="crp" icon={FiInfo} value={profile.crp || ''} onChange={handleChange} disabled={true} />
                                <FormField label="Configurações de Agenda" name="configuracoes_agenda" icon={FiCalendar} value={profile.configuracoes_agenda || ''} onChange={handleChange} placeholder="Ex: Seg/Qua/Sex: 9h-18h" />
                            </>
                        )}
                    </div>
                    
                    {/* Campos de Texto Longo (Bio/Observações) - DINÂMICO */}
                    {isPatient ? (
                        <FormField 
                            label="Observações Adicionais (Apenas leitura para o paciente)" 
                            name="observacoes_iniciais" 
                            icon={FiInfo} 
                            value={profile.observacoes_iniciais} 
                            onChange={handleChange} 
                            isTextArea={true}
                            disabled={true} // O paciente geralmente não edita essa observação inicial
                            placeholder="Informações de registro fornecidas na anamnese inicial."
                        />
                    ) : (
                        <FormField 
                            label="Biografia Profissional (Bio)" 
                            name="bio" 
                            icon={FiInfo} 
                            value={profile.bio || ''} 
                            onChange={handleChange} 
                            isTextArea={true}
                            placeholder="Descreva sua especialidade e abordagem (Ex: TCC, Psicanálise)..."
                        />
                    )}

                    <div className={styles.buttonContainer}>
                        <button type="submit" disabled={isSaving} className={styles.saveButton}>
                            <FiSave /> {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* O Modal de Senha (Comum a ambos) */}
            <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default SettingsPage;