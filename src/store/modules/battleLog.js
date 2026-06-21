import { defineStore } from 'pinia';

let actionIdCounter = 0;
let chainIdCounter = 0;

const generateActionId = () => ++actionIdCounter;
const generateChainId = () => ++chainIdCounter;

const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export default defineStore('battleLog', {
  state: () => ({
    actionChains: [],
    currentChainId: null,
    members: [
      { id: 1, name: '队长', avatar: '🧑‍✈️', status: 'healthy', health: 100, energy: 100 },
      { id: 2, name: '探险家', avatar: '🧑‍🌾', status: 'healthy', health: 100, energy: 80 }
    ],
    mapPosition: { x: 1, y: 1, location: '营地' },
    legacyLogs: []
  }),

  getters: {
    currentChain: (state) => {
      return state.actionChains.find(chain => chain.id === state.currentChainId) || null;
    },
    allActionsFlat: (state) => {
      const actions = [];
      state.actionChains.forEach(chain => {
        chain.actions.forEach(action => {
          actions.push({ ...action, chainId: chain.id, chainName: chain.name });
        });
      });
      return actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    recentActions: (state) => {
      const actions = [];
      state.actionChains.forEach(chain => {
        chain.actions.forEach(action => {
          actions.push({ ...action, chainId: chain.id, chainName: chain.name });
        });
      });
      return actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
    },
    memberStatusList: (state) => state.members
  },

  actions: {
    createActionChain(name, description = '', type = 'normal') {
      const chain = {
        id: generateChainId(),
        name,
        description,
        type,
        startTime: new Date(),
        endTime: null,
        status: 'active',
        actions: [],
        resourceSnapshot: null
      };
      this.actionChains.unshift(chain);
      this.currentChainId = chain.id;
      return chain;
    },

    endCurrentChain() {
      const chain = this.currentChain;
      if (chain) {
        chain.endTime = new Date();
        chain.status = 'completed';
        this.currentChainId = null;
      }
    },

    addAction({ name, type, description, resourceChanges = {}, mapChange = null, memberChanges = [], result = 'success' }) {
      const now = new Date();
      const action = {
        id: generateActionId(),
        name,
        type,
        description,
        timestamp: now,
        timeStr: formatTime(now),
        resourceChanges,
        mapChange,
        memberChanges,
        result
      };

      let chain = this.currentChain;
      if (!chain) {
        chain = this.createActionChain('默认行动链', '自动创建的行动链', 'auto');
      }

      chain.actions.push(action);

      if (mapChange) {
        this.mapPosition = { ...this.mapPosition, ...mapChange };
      }

      memberChanges.forEach(memberChange => {
        const member = this.members.find(m => m.id === memberChange.id);
        if (member) {
          if (memberChange.health !== undefined) {
            member.health = Math.max(0, Math.min(100, member.health + memberChange.health));
          }
          if (memberChange.energy !== undefined) {
            member.energy = Math.max(0, Math.min(100, member.energy + memberChange.energy));
          }
          if (memberChange.status) {
            member.status = memberChange.status;
          }
        }
      });

      this.legacyLogs.push({
        time: action.timeStr,
        content: description
      });

      if (this.legacyLogs.length > 100) {
        this.legacyLogs.shift();
      }

      return action;
    },

    addLegacyLog(content) {
      const now = new Date();
      this.legacyLogs.push({
        time: formatTime(now),
        content
      });
      if (this.legacyLogs.length > 100) {
        this.legacyLogs.shift();
      }
    },

    getChainById(id) {
      return this.actionChains.find(chain => chain.id === id);
    },

    updateMemberStatus(memberId, updates) {
      const member = this.members.find(m => m.id === memberId);
      if (member) {
        Object.assign(member, updates);
      }
    },

    setMapPosition(position) {
      this.mapPosition = { ...this.mapPosition, ...position };
    },

    clearAll() {
      this.actionChains = [];
      this.currentChainId = null;
      this.legacyLogs = [];
      actionIdCounter = 0;
      chainIdCounter = 0;
    }
  }
});
