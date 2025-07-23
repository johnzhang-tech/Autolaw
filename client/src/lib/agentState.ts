// Global state management for preserving agent iframe states across page navigation

interface AgentIframeState {
  src: string;
  loaded: boolean;
  lastAccessed: number;
  iframe?: HTMLIFrameElement;
}

interface AgentStateManager {
  agents: {
    [key: string]: AgentIframeState;
  };
  activeAgent: string;
  iframeContainer?: HTMLDivElement;
}

// Global state stored in sessionStorage for persistence across page navigation
const STORAGE_KEY = 'mr-assistant-state';

const defaultAgents = {
  agent1: {
    src: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=ef91e43c674a11f0b85b0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
    loaded: true,
    lastAccessed: Date.now()
  },
  agent2: {
    src: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=f73d46aa674e11f09eda0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
    loaded: false,
    lastAccessed: 0
  },
  agent3: {
    src: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=6a016e68674b11f090050242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
    loaded: false,
    lastAccessed: 0
  }
};

class AgentState {
  private state: AgentStateManager;

  constructor() {
    // Try to load existing state from sessionStorage
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        // Ensure all default agents exist
        Object.keys(defaultAgents).forEach(key => {
          const agentKey = key as keyof typeof defaultAgents;
          if (!this.state.agents[agentKey]) {
            this.state.agents[agentKey] = defaultAgents[agentKey];
          }
        });
      } catch (e) {
        this.state = {
          agents: defaultAgents,
          activeAgent: 'agent1'
        };
      }
    } else {
      this.state = {
        agents: defaultAgents,
        activeAgent: 'agent1'
      };
    }
  }

  getState() {
    return this.state;
  }

  setActiveAgent(agentId: string) {
    this.state.activeAgent = agentId;
    const agent = this.state.agents[agentId as keyof typeof this.state.agents];
    if (agent) {
      agent.lastAccessed = Date.now();
    }
    this.save();
  }

  markAgentLoaded(agentId: string) {
    const agent = this.state.agents[agentId as keyof typeof this.state.agents];
    if (agent) {
      agent.loaded = true;
      agent.lastAccessed = Date.now();
      this.save();
    }
  }

  isAgentLoaded(agentId: string): boolean {
    const agent = this.state.agents[agentId as keyof typeof this.state.agents];
    return agent?.loaded || false;
  }

  getActiveAgent(): string {
    return this.state.activeAgent;
  }

  private save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save agent state to sessionStorage');
    }
  }

  // Store iframe reference for persistence
  storeIframe(agentId: string, iframe: HTMLIFrameElement) {
    const agent = this.state.agents[agentId as keyof typeof this.state.agents];
    if (agent) {
      agent.iframe = iframe;
    }
  }

  // Get stored iframe
  getStoredIframe(agentId: string): HTMLIFrameElement | undefined {
    const agent = this.state.agents[agentId as keyof typeof this.state.agents];
    return agent?.iframe;
  }

  // Set iframe container for global management
  setIframeContainer(container: HTMLDivElement) {
    this.state.iframeContainer = container;
  }

  // Get iframe container
  getIframeContainer(): HTMLDivElement | undefined {
    return this.state.iframeContainer;
  }

  // Clear all conversation states (for "New Conversation" functionality)
  clearAgentState(agentId: string) {
    const agent = this.state.agents[agentId as keyof typeof this.state.agents];
    if (agent) {
      agent.loaded = false;
      agent.lastAccessed = 0;
      agent.iframe = undefined;
      this.save();
    }
  }

  // Clear all states
  clearAllStates() {
    // Clean up iframe references
    Object.values(this.state.agents).forEach(agent => {
      if (agent.iframe) {
        agent.iframe = undefined;
      }
    });
    
    this.state = {
      agents: defaultAgents,
      activeAgent: 'agent1'
    };
    this.save();
  }
}

// Global singleton instance
export const agentStateManager = new AgentState();

// Hook for React components
export function useAgentState() {
  return agentStateManager;
}