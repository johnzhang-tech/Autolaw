import { useState, useEffect, useRef } from 'react';

// Global state for iframe persistence
const PERSISTENCE_CONTAINER_ID = 'ragflow-agents-persistence';
const ACTIVE_TAB_KEY = 'ragflow-active-tab';

interface AgentConfig {
  src: string;
  title: string;
}

let persistenceContainer: HTMLDivElement | null = null;
let iframeInstances: Record<string, HTMLIFrameElement> = {};

function initPersistenceContainer() {
  if (!persistenceContainer) {
    // Remove any existing container
    const existing = document.getElementById(PERSISTENCE_CONTAINER_ID);
    if (existing) {
      existing.remove();
    }

    persistenceContainer = document.createElement('div');
    persistenceContainer.id = PERSISTENCE_CONTAINER_ID;
    persistenceContainer.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 1000px;
      height: 800px;
      overflow: hidden;
      pointer-events: none;
      visibility: hidden;
      z-index: -9999;
    `;
    document.body.appendChild(persistenceContainer);
  }
  return persistenceContainer;
}

function createIframe(agentId: string, config: AgentConfig): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.id = `agent-iframe-${agentId}`;
  iframe.src = config.src;
  iframe.title = config.title;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  `;
  
  // Store in global registry
  iframeInstances[agentId] = iframe;
  
  // Add to persistence container
  const container = initPersistenceContainer();
  container.appendChild(iframe);
  
  return iframe;
}

export function useGlobalIframePersistence() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(ACTIVE_TAB_KEY) || 'agent1';
  });
  
  const displayContainerRef = useRef<HTMLDivElement>(null);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  const initializeAgent = (agentId: string, config: AgentConfig) => {
    if (!iframeInstances[agentId]) {
      createIframe(agentId, config);
    }
  };

  const displayAgent = (agentId: string) => {
    if (displayContainerRef.current && iframeInstances[agentId]) {
      const container = displayContainerRef.current;
      
      // Clear current content
      container.innerHTML = '';
      
      // Create a wrapper div that mirrors the iframe
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        background: white;
        border-radius: 8px;
      `;
      
      // Clone the iframe for display
      const displayIframe = iframeInstances[agentId].cloneNode(false) as HTMLIFrameElement;
      displayIframe.src = iframeInstances[agentId].src;
      displayIframe.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 600px;
        border: none;
        border-radius: 8px;
      `;
      
      wrapper.appendChild(displayIframe);
      container.appendChild(wrapper);
      
      // Sync the iframe state by copying the document if possible
      try {
        displayIframe.onload = () => {
          // The iframe will reload with the same session/state from the URL
        };
      } catch (e) {
        // Cross-origin restrictions, but the iframe should maintain state via URL
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    initializeAgent,
    displayAgent,
    displayContainerRef
  };
}