// Global iframe persistence system that survives page navigation

interface AgentConfig {
  src: string;
  title: string;
}

class GlobalIframePersistence {
  private container: HTMLDivElement | null = null;
  private iframes: Record<string, HTMLIFrameElement> = {};
  private initialized = false;

  private initContainer() {
    if (!this.container) {
      // Remove any existing container
      const existing = document.getElementById('global-ragflow-persistence');
      if (existing) existing.remove();

      this.container = document.createElement('div');
      this.container.id = 'global-ragflow-persistence';
      this.container.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 1200px;
        height: 800px;
        overflow: hidden;
        pointer-events: none;
        z-index: -9999;
        visibility: hidden;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  initializeAgents(agents: Record<string, AgentConfig>) {
    if (this.initialized) return;
    
    const container = this.initContainer();
    
    Object.entries(agents).forEach(([agentId, config]) => {
      if (!this.iframes[agentId]) {
        const iframe = document.createElement('iframe');
        iframe.id = `ragflow-${agentId}`;
        iframe.src = config.src;
        iframe.title = config.title;
        iframe.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 8px;
        `;
        
        this.iframes[agentId] = iframe;
        container.appendChild(iframe);
      }
    });
    
    this.initialized = true;
  }

  getIframe(agentId: string): HTMLIFrameElement | null {
    return this.iframes[agentId] || null;
  }

  moveToDisplay(agentId: string, displayContainer: HTMLElement) {
    const iframe = this.iframes[agentId];
    if (iframe && displayContainer) {
      // Clear display container
      displayContainer.innerHTML = '';
      // Move iframe to display
      displayContainer.appendChild(iframe);
    }
  }

  moveToStorage(agentId: string) {
    const iframe = this.iframes[agentId];
    const container = this.initContainer();
    if (iframe && container && iframe.parentNode !== container) {
      container.appendChild(iframe);
    }
  }

  moveAllToStorage() {
    const container = this.initContainer();
    Object.values(this.iframes).forEach(iframe => {
      if (iframe.parentNode !== container) {
        container.appendChild(iframe);
      }
    });
  }

  cleanup() {
    // Move all iframes back to storage when page is about to unload
    this.moveAllToStorage();
  }
}

// Create global instance
export const globalPersistence = new GlobalIframePersistence();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalPersistence.cleanup();
  });
}