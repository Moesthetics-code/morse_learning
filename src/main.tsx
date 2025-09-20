import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Composant wrapper pour gérer le zoom
function AppWithZoom() {
  useEffect(() => {
    // Définir le zoom à 80% au chargement de l'application
    document.body.style.zoom = '0.8';
    
    // Alternative avec CSS transform si zoom n'est pas supporté
    // document.body.style.transform = 'scale(0.8)';
    // document.body.style.transformOrigin = 'top left';
    // document.body.style.width = '125%'; // Compensation pour transform scale
    
    // Nettoyage optionnel au démontage du composant
    return () => {
      // Remettre le zoom par défaut si nécessaire
      // document.body.style.zoom = '1';
    };
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithZoom />
  </StrictMode>
);