import { useState, useEffect, useRef } from 'react';

interface AgentState {
  activeTab: string;
  iframeStates: Record<string, HTMLIFrameElement | null>;
}

export function useAgentPersistence() {
  const [activeTab, setActiveTab] = useState('agent1');
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  // Create hidden container for iframe persistence on mount
  useEffect(() => {
    // Create hidden container if it doesn't exist
    if (!hiddenContainerRef.current) {
      const container = document.createElement('div');
      container.id = 'agent-iframe-persistence';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
      hiddenContainerRef.current = container;
    }

    // Load saved state
    const savedTab = localStorage.getItem('agent-active-tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }

    return () => {
      // Cleanup on unmount - move iframes to hidden container
      if (hiddenContainerRef.current) {
        Object.values(iframeRefs.current).forEach(iframe => {
          if (iframe && iframe.parentNode) {
            hiddenContainerRef.current?.appendChild(iframe);
          }
        });
      }
    };
  }, []);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('agent-active-tab', activeTab);
  }, [activeTab]);

  const createOrGetIframe = (agentId: string, src: string, title: string) => {
    // Check if iframe already exists in hidden container
    let iframe = iframeRefs.current[agentId];
    
    if (!iframe) {
      // Create new iframe
      iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = title;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.minHeight = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      iframeRefs.current[agentId] = iframe;
      
      // Initially place in hidden container
      if (hiddenContainerRef.current) {
        hiddenContainerRef.current.appendChild(iframe);
      }
    }
    
    return iframe;
  };

  const moveIframeToContainer = (agentId: string, container: HTMLElement) => {
    const iframe = iframeRefs.current[agentId];
    if (iframe && container) {
      // Clear container first
      container.innerHTML = '';
      // Move iframe to visible container
      container.appendChild(iframe);
    }
  };

  const moveIframeToHidden = (agentId: string) => {
    const iframe = iframeRefs.current[agentId];
    if (iframe && hiddenContainerRef.current) {
      hiddenContainerRef.current.appendChild(iframe);
    }
  };

  return {
    activeTab,
    setActiveTab,
    createOrGetIframe,
    moveIframeToContainer,
    moveIframeToHidden
  };
}