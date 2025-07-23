// Global iframe management to preserve conversations across page navigation

class GlobalIframeManager {
  private container: HTMLDivElement | null = null;
  private iframes: Map<string, HTMLIFrameElement> = new Map();
  private initialized = false;

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Create a hidden container that persists across page navigation
    this.container = document.createElement('div');
    this.container.id = 'global-iframe-container';
    this.container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 0;
      height: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: -1;
    `;
    
    document.body.appendChild(this.container);
    this.initialized = true;
  }

  createOrGetIframe(agentId: string, src: string): HTMLIFrameElement {
    this.init();
    
    let iframe = this.iframes.get(agentId);
    
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 600px;
        border: none;
        border-radius: 0 0 8px 8px;
      `;
      iframe.title = `Agent ${agentId}`;
      iframe.frameBorder = '0';
      
      this.iframes.set(agentId, iframe);
      
      // Store in hidden container to prevent unmounting
      if (this.container) {
        this.container.appendChild(iframe);
      }
    }
    
    return iframe;
  }

  moveIframeToContainer(agentId: string, targetContainer: HTMLElement) {
    const iframe = this.iframes.get(agentId);
    if (iframe && targetContainer) {
      // Remove from current location and add to target
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      targetContainer.appendChild(iframe);
    }
  }

  hideIframe(agentId: string) {
    const iframe = this.iframes.get(agentId);
    if (iframe && this.container) {
      // Move back to hidden container
      if (iframe.parentNode && iframe.parentNode !== this.container) {
        iframe.parentNode.removeChild(iframe);
        this.container.appendChild(iframe);
      }
    }
  }

  isIframeLoaded(agentId: string): boolean {
    return this.iframes.has(agentId);
  }

  destroy() {
    this.iframes.clear();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.initialized = false;
  }
}

// Global singleton instance
export const globalIframeManager = new GlobalIframeManager();

// Initialize on import
if (typeof window !== 'undefined') {
  globalIframeManager.init();
}