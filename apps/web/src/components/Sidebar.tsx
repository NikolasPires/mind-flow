// src/components/Sidebar.tsx
import React, { useState } from 'react'; // <--- Importar useState
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
// Importação dos ícones que vamos usar
import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings, FiMenu, FiX } from 'react-icons/fi'; // <--- Importar FiMenu e FiX
import { signOut } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // <--- Novo estado para controlar o menu
  const isActive = (pathname: string) => router.pathname.startsWith(pathname);
  
  // Função para fechar o menu quando um link é clicado (útil para mobile)
  const handleLinkClick = () => {
      setIsOpen(false);
  };

  return (
    <>
      {/* Botão Hambúrguer para Mobile/Tablet */}
      <button 
        className={styles.hamburgerButton} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Overlay Escuro quando o menu está aberto (apenas em mobile) */}
      {isOpen && <div className={styles.sidebarOverlay} onClick={() => setIsOpen(false)} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}> {/* <--- Adicionar classe 'open' */}
        <div className={styles.logoContainer}>
          <img src="/LogoBranco.png" alt="MindFlow Logo" className={styles.logo} />
        </div>
        <nav className={styles.navigation}>
          <ul>
            {/* Dashboard */}
            <li className={isActive('/dashboard') ? styles.active : ''}>
              <Link href="/dashboard" className={styles.navLink} onClick={handleLinkClick}>
                <FiHome className={styles.icon} />
                <span>Dashboard</span>
              </Link>
            </li>
            {/* Agenda */}
            <li className={isActive('/agenda') ? styles.active : ''}>
              <Link href="/agenda" className={styles.navLink} onClick={handleLinkClick}>
                <FiCalendar className={styles.icon} />
                <span>Agenda</span>
              </Link>
            </li>
            {/* Pacientes */}
            <li className={isActive('/pacientes') ? styles.active : ''}>
              <Link href="/pacientes" className={styles.navLink} onClick={handleLinkClick}>
                <FiUsers className={styles.icon} />
                <span>Pacientes</span>
              </Link>
            </li>
            {/* Relatórios - Temporariamente oculto até implementação */}
            {/* <li className={isActive('/relatorios') ? styles.active : ''}>
              <Link href="/relatorios" className={styles.navLink} onClick={handleLinkClick}>
                <FiBarChart2 className={styles.icon} />
                <span>Relatórios</span>
              </Link>
            </li> */}
            {/* Configurações */}
            <li className={isActive('/configuracoes') ? styles.active : ''}>
              <Link href="/configuracoes" className={styles.navLink} onClick={handleLinkClick}>
                <FiSettings className={styles.icon} />
                <span>Configurações</span>
              </Link>
            </li>
          </ul>
        </nav>
                {/* Botão de Logout */}
        <div className={styles.logoutContainer}>
          <button
            className={styles.logoutButton}
            onClick={() => {
              setIsOpen(false); // se estiver no mobile, fecha o menu
              signOut({ callbackUrl: "/login" }); // redireciona para login
            }}
          >
            <FiLogOut className={styles.icon} />
            <span>Sair</span>
          </button>
        </div>

      </aside>
  

    </>
  );
};

export default Sidebar;