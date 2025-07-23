import { useState, useEffect, useRef } from 'react';

// Global persistence container
let globalPersistenceContainer: HTMLDivElement | null = null;
let globalIframeRefs: Record<string, HTMLIFrameElement> = {};

function getOrCreatePersistenceContainer(): HTMLDivElement {
  if (!globalPersistenceContainer) {
    globalPersistenceContainer = document.createElement('div');
    globalPersistenceContainer.id = 'global-agent-persistence';
    globalPersistenceContainer.style.position = 'fixed';
    globalPersistenceContainer.style.top = '0';
    globalPersistenceContainer.style.left = '0';
    globalPersistenceContainer.style.width = '100vw';
    globalPersistenceContainer.style.height = '100vh';
    globalPersistenceContainer.style.pointerEvents = 'none';
    globalPersistenceContainer.style.zIndex = '-1000';
    globalPersistenceContainer.style.visibility = 'hidden';
    document.body.appendChild(globalPersistenceContainer);
  }
  return globalPersistenceContainer;
}

export function useAgentPersistence() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('agent-active-tab') || 'agent1';
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('agent-active-tab', activeTab);
  }, [activeTab]);

  const ensureIframeExists = (agentId: string, src: string, title: string): HTMLIFrameElement => {
    if (!globalIframeRefs[agentId]) {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = title;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.minHeight = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      
      globalIframeRefs[agentId] = iframe;
      
      // Add to global persistence container
      const container = getOrCreatePersistenceContainer();
      container.appendChild(iframe);
    }
    
    return globalIframeRefs[agentId];
  };

  const showIframe = (agentId: string, targetContainer: HTMLElement) => {
    const iframe = globalIframeRefs[agentId];
    if (iframe && targetContainer) {
      // Clone the iframe and place it in the target container
      const clone = iframe.cloneNode(true) as HTMLIFrameElement;
      clone.style.position = 'static';
      clone.style.visibility = 'visible';
      clone.style.pointerEvents = 'auto';
      
      // Clear target container and add clone
      targetContainer.innerHTML = '';
      targetContainer.appendChild(clone);
      
      // Copy the src to ensure it loads
      clone.src = iframe.src;
    }
  };

  const hideAllIframes = (targetContainer: HTMLElement) => {
    if (targetContainer) {
      targetContainer.innerHTML = '';
    }
  };

  return {
    activeTab,
    setActiveTab,
    ensureIframeExists,
    showIframe,
    hideAllIframes
  };
}