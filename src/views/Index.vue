<template>
  <div class="island-container">
    <div class="island-header">
      <h1>🏝️ 海岛生存</h1>
      <p>在荒岛上建立你的生存基地</p>
    </div>
    
    <div class="island-main">
      <div class="stats-panel">
        <div class="stat-card">
          <div class="stat-icon">🍖</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.food }}</div>
            <div class="stat-label">食物</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💧</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.water }}</div>
            <div class="stat-label">淡水</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🪵</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.wood }}</div>
            <div class="stat-label">木材</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⛏️</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.stone }}</div>
            <div class="stat-label">石头</div>
          </div>
        </div>
      </div>

      <div class="member-panel">
        <h3>👥 队伍成员</h3>
        <div class="member-list">
          <div class="member-card" v-for="member in battleLogStore.memberStatusList" :key="member.id">
            <div class="member-avatar">{{ member.avatar }}</div>
            <div class="member-info">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-status-bar">
                <div class="status-item">
                  <span class="status-label">❤️ 生命</span>
                  <div class="progress-bar">
                    <div class="progress-fill health" :style="{ width: member.health + '%' }"></div>
                  </div>
                  <span class="status-value">{{ member.health }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">⚡ 体力</span>
                  <div class="progress-bar">
                    <div class="progress-fill energy" :style="{ width: member.energy + '%' }"></div>
                  </div>
                  <span class="status-value">{{ member.energy }}</span>
                </div>
              </div>
            </div>
            <div class="member-status-tag" :class="member.status">
              {{ getStatusText(member.status) }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions-panel">
        <h3>📋 可执行操作</h3>
        
        <div class="action-grid">
          <div class="action-card" @click="gatherFood">
            <div class="action-icon">🍓</div>
            <div class="action-title">采集食物</div>
            <div class="action-desc">在岛上寻找可食用的果实和动物</div>
            <div class="action-time">耗时: 30秒</div>
          </div>
          
          <div class="action-card" @click="collectWater">
            <div class="action-icon">💧</div>
            <div class="action-title">收集淡水</div>
            <div class="action-desc">收集雨水或净化海水</div>
            <div class="action-time">耗时: 1分钟</div>
          </div>
          
          <div class="action-card" @click="chopWood">
            <div class="action-icon">🪓</div>
            <div class="action-title">砍伐木材</div>
            <div class="action-desc">砍伐树木获取木材资源</div>
            <div class="action-time">耗时: 2分钟</div>
          </div>
          
          <div class="action-card" @click="mineStone">
            <div class="action-icon">⛏️</div>
            <div class="action-title">挖掘石头</div>
            <div class="action-desc">在岛上挖掘石头资源</div>
            <div class="action-time">耗时: 3分钟</div>
          </div>
          
          <div class="action-card" @click="buildShelter">
            <div class="action-icon">🏠</div>
            <div class="action-title">建造庇护所</div>
            <div class="action-desc">建造一个安全的住所</div>
            <div class="action-cost">需要: 50木材, 30石头</div>
          </div>
          
          <div class="action-card" @click="craftTools">
            <div class="action-icon">🔨</div>
            <div class="action-title">制作工具</div>
            <div class="action-desc">制作更高效的生存工具</div>
            <div class="action-cost">需要: 20木材, 10石头</div>
          </div>
        </div>
      </div>
      
      <div class="map-panel">
        <h3>🗺️ 海岛地图</h3>
        <div class="map-container">
          <div class="map-grid">
            <div v-for="(cell, index) in mapGrid" :key="index" 
                 :class="['map-cell', cell.type, { explored: cell.explored, current: isCurrentPosition(index) }]"
                 @click="exploreCell(index)">
              {{ cell.icon }}
            </div>
          </div>
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-icon">🌳</span>
              <span>森林</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🏔️</span>
              <span>山地</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🌊</span>
              <span>海洋</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🏠</span>
              <span>营地</span>
            </div>
          </div>
          <div class="current-position">
            📍 当前位置: {{ battleLogStore.mapPosition.location }} ({{ battleLogStore.mapPosition.x }}, {{ battleLogStore.mapPosition.y }})
          </div>
        </div>
      </div>
    </div>
    
    <div class="battle-log-panel">
      <div class="panel-header">
        <h3>📜 作战记录台</h3>
        <div class="tab-switcher">
          <button :class="['tab-btn', { active: activeTab === 'chains' }]" @click="activeTab = 'chains'">
            🔗 行动链
          </button>
          <button :class="['tab-btn', { active: activeTab === 'timeline' }]" @click="activeTab = 'timeline'">
            ⏱️ 时间线
          </button>
          <button :class="['tab-btn', { active: activeTab === 'legacy' }]" @click="activeTab = 'legacy'">
            📝 旧日志
          </button>
        </div>
      </div>

      <div class="panel-content">
        <div v-if="activeTab === 'chains'" class="chains-view">
          <div class="chain-controls">
            <el-button size="small" type="primary" @click="startNewChain">
              + 新建行动链
            </el-button>
            <el-button size="small" v-if="battleLogStore.currentChainId" @click="endChain">
              结束当前链
            </el-button>
          </div>
          
          <div class="chains-list">
            <div v-for="chain in battleLogStore.actionChains" :key="chain.id" 
                 :class="['chain-item', { active: chain.id === battleLogStore.currentChainId }]"
                 @click="selectChain(chain.id)">
              <div class="chain-header">
                <div class="chain-title">
                  <span class="chain-icon">{{ getChainIcon(chain.type) }}</span>
                  <span class="chain-name">{{ chain.name }}</span>
                </div>
                <el-tag size="small" :type="getChainStatusType(chain.status)">
                  {{ getChainStatusText(chain.status) }}
                </el-tag>
              </div>
              <div class="chain-meta">
                <span>⏰ {{ formatChainTime(chain.startTime) }}</span>
                <span>🎯 {{ chain.actions.length }} 个行动</span>
              </div>
              <div class="chain-description" v-if="chain.description">
                {{ chain.description }}
              </div>

              <div v-if="selectedChainId === chain.id && chain.actions.length > 0" class="chain-actions">
                <div v-for="action in chain.actions" :key="action.id" class="action-detail-item">
                  <div class="action-time-badge">{{ action.timeStr }}</div>
                  <div class="action-detail-content">
                    <div class="action-detail-title">
                      <span class="action-type-tag" :class="action.type">{{ getActionTypeText(action.type) }}</span>
                      <span class="action-name">{{ action.name }}</span>
                      <el-tag size="small" :type="action.result === 'success' ? 'success' : 'danger'" class="action-result">
                        {{ action.result === 'success' ? '成功' : '失败' }}
                      </el-tag>
                    </div>
                    <div class="action-description">{{ action.description }}</div>
                    
                    <div v-if="Object.keys(action.resourceChanges).length > 0" class="resource-changes">
                      <span class="changes-label">资源变化:</span>
                      <span v-for="(value, key) in action.resourceChanges" :key="key" 
                            :class="['change-tag', value > 0 ? 'positive' : 'negative']">
                        {{ getResourceIcon(key) }} {{ value > 0 ? '+' : '' }}{{ value }}
                      </span>
                    </div>

                    <div v-if="action.mapChange" class="map-change">
                      <span class="changes-label">位置变化:</span>
                      <span class="change-tag info">
                        📍 {{ action.mapChange.location || '未知' }}
                      </span>
                    </div>

                    <div v-if="action.memberChanges && action.memberChanges.length > 0" class="member-changes">
                      <span class="changes-label">成员状态:</span>
                      <span v-for="mc in action.memberChanges" :key="mc.id" class="change-tag info">
                        {{ getMemberName(mc.id) }}
                        <span v-if="mc.health !== undefined">{{ mc.health > 0 ? '+' : '' }}{{ mc.health }}❤️</span>
                        <span v-if="mc.energy !== undefined">{{ mc.energy > 0 ? '+' : '' }}{{ mc.energy }}⚡</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="battleLogStore.actionChains.length === 0" class="empty-state">
            <div class="empty-icon">🔗</div>
            <p>暂无行动链，点击上方按钮开始记录</p>
          </div>
        </div>

        <div v-if="activeTab === 'timeline'" class="timeline-view">
          <div class="timeline-list">
            <div v-for="action in battleLogStore.recentActions" :key="action.id" class="timeline-item">
              <div class="timeline-dot" :class="action.type"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-time">{{ action.timeStr }}</span>
                  <span class="timeline-chain">所属: {{ action.chainName }}</span>
                </div>
                <div class="timeline-title">{{ action.name }}</div>
                <div class="timeline-desc">{{ action.description }}</div>
                
                <div v-if="Object.keys(action.resourceChanges).length > 0" class="timeline-resources">
                  <span v-for="(value, key) in action.resourceChanges" :key="key" 
                        :class="['resource-badge', value > 0 ? 'gain' : 'lose']">
                    {{ getResourceIcon(key) }} {{ value > 0 ? '+' : '' }}{{ value }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="battleLogStore.recentActions.length === 0" class="empty-state">
            <div class="empty-icon">⏱️</div>
            <p>暂无行动记录</p>
          </div>
        </div>

        <div v-if="activeTab === 'legacy'" class="legacy-view">
          <div class="log-list">
            <div v-for="(msg, index) in allLegacyLogs" :key="index" class="log-item">
              <span class="log-time">{{ msg.time }}</span>
              <span class="log-content">{{ msg.content }}</span>
            </div>
          </div>

          <div v-if="allLegacyLogs.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无日志记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElInput } from 'element-plus';
import { useBattleLogStore } from '../store';

const battleLogStore = useBattleLogStore();

const resources = ref({
  food: 100,
  water: 100,
  wood: 100,
  stone: 100
});

const mapGrid = ref([
  { type: 'forest', icon: '🌳', explored: true, name: '森林北部', x: 0, y: 0 },
  { type: 'forest', icon: '🌳', explored: true, name: '森林中部', x: 1, y: 0 },
  { type: 'mountain', icon: '🏔️', explored: false, name: '北部山地', x: 2, y: 0 },
  { type: 'ocean', icon: '🌊', explored: false, name: '西海岸', x: 0, y: 1 },
  { type: 'camp', icon: '🏠', explored: true, name: '营地', x: 1, y: 1 },
  { type: 'forest', icon: '🌳', explored: false, name: '东部森林', x: 2, y: 1 },
  { type: 'ocean', icon: '🌊', explored: false, name: '南海岸', x: 0, y: 2 },
  { type: 'mountain', icon: '🏔️', explored: false, name: '南部山地', x: 1, y: 2 },
  { type: 'forest', icon: '🌳', explored: false, name: '东南森林', x: 2, y: 2 }
]);

const activeTab = ref('chains');
const selectedChainId = ref(null);

const allLegacyLogs = computed(() => {
  const logs = [...battleLogStore.legacyLogs].reverse();
  return logs;
});

const isCurrentPosition = (index) => {
  const cell = mapGrid.value[index];
  return cell.x === battleLogStore.mapPosition.x && cell.y === battleLogStore.mapPosition.y;
};

const getStatusText = (status) => {
  const statusMap = {
    healthy: '健康',
    tired: '疲惫',
    injured: '受伤',
    sick: '生病'
  };
  return statusMap[status] || status;
};

const getResourceIcon = (key) => {
  const iconMap = {
    food: '🍖',
    water: '💧',
    wood: '🪵',
    stone: '⛏️'
  };
  return iconMap[key] || '📦';
};

const getChainIcon = (type) => {
  const iconMap = {
    normal: '🎯',
    auto: '⚙️',
    exploration: '🗺️',
    building: '🏗️',
    gathering: '🧺'
  };
  return iconMap[type] || '🔗';
};

const getChainStatusType = (status) => {
  const typeMap = {
    active: 'primary',
    completed: 'success',
    failed: 'danger'
  };
  return typeMap[status] || 'info';
};

const getChainStatusText = (status) => {
  const textMap = {
    active: '进行中',
    completed: '已完成',
    failed: '失败'
  };
  return textMap[status] || status;
};

const getActionTypeText = (type) => {
  const textMap = {
    gather: '采集',
    build: '建造',
    explore: '探索',
    craft: '制作',
    consume: '消耗',
    system: '系统',
    combat: '战斗'
  };
  return textMap[type] || type;
};

const getMemberName = (id) => {
  const member = battleLogStore.memberStatusList.find(m => m.id === id);
  return member ? member.name : '未知成员';
};

const formatChainTime = (time) => {
  const date = new Date(time);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

const selectChain = (id) => {
  selectedChainId.value = selectedChainId.value === id ? null : id;
};

const startNewChain = async () => {
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入行动链名称',
      '新建行动链',
      {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：资源采集行动'
      }
    );
    if (value) {
      battleLogStore.createActionChain(value, '', 'normal');
      selectedChainId.value = battleLogStore.currentChainId;
      ElMessage.success('行动链已创建');
    }
  } catch {
    // 用户取消
  }
};

const endChain = () => {
  battleLogStore.endCurrentChain();
  ElMessage.success('行动链已结束');
};

const addMessage = (content) => {
  battleLogStore.addLegacyLog(content);
};

const performAction = (name, type, cost, gain, time, memberChanges = []) => {
  for (const [resource, amount] of Object.entries(cost)) {
    if (resources.value[resource] < amount) {
      ElMessage.error(`资源不足，无法${name}`);
      return false;
    }
  }
  
  for (const [resource, amount] of Object.entries(cost)) {
    resources.value[resource] -= amount;
  }
  
  const resourceChanges = { ...Object.fromEntries(Object.entries(cost).map(([k, v]) => [k, -v])) };
  
  battleLogStore.addAction({
    name: `开始${name}`,
    type,
    description: `开始执行${name}操作`,
    resourceChanges,
    memberChanges: memberChanges.map(m => ({ ...m, energy: m.energy || -5 })),
    result: 'success'
  });
  
  setTimeout(() => {
    const gainChanges = { ...gain };
    for (const [resource, amount] of Object.entries(gain)) {
      resources.value[resource] += amount;
    }
    
    battleLogStore.addAction({
      name: `${name}完成`,
      type,
      description: `${name}完成！获得了${Object.entries(gain).map(([k, v]) => `${v}${k}`).join('、')}`,
      resourceChanges: gainChanges,
      result: 'success'
    });
    
    ElMessage.success(`${name}完成！`);
  }, time);
  
  return true;
};

const gatherFood = () => {
  performAction('采集食物', 'gather', {}, { food: 20 }, 3000, [{ id: 1, energy: -10 }]);
};

const collectWater = () => {
  performAction('收集淡水', 'gather', {}, { water: 30 }, 6000, [{ id: 2, energy: -10 }]);
};

const chopWood = () => {
  performAction('砍伐木材', 'gather', {}, { wood: 15 }, 12000, [{ id: 1, energy: -15 }]);
};

const mineStone = () => {
  performAction('挖掘石头', 'gather', {}, { stone: 10 }, 18000, [{ id: 1, energy: -20 }, { id: 2, energy: -10 }]);
};

const buildShelter = () => {
  if (performAction('建造庇护所', 'build', { wood: 50, stone: 30 }, {}, 30000, [{ id: 1, energy: -25 }, { id: 2, energy: -25 }])) {
    addMessage('庇护所建造完成！你现在有了一个安全的住所。');
  }
};

const craftTools = () => {
  if (performAction('制作工具', 'craft', { wood: 20, stone: 10 }, {}, 12000, [{ id: 1, energy: -15 }])) {
    addMessage('工具制作完成！你的工作效率提高了。');
  }
};

const exploreCell = (index) => {
  const cell = mapGrid.value[index];
  if (cell.explored) {
    ElMessage.info('这个区域已经探索过了');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要探索${cell.name}吗？可能会遇到危险或发现资源。`,
    '探索未知区域',
    {
      confirmButtonText: '开始探索',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    battleLogStore.addAction({
      name: `探索${cell.name}`,
      type: 'explore',
      description: `开始探索${cell.icon}区域...`,
      mapChange: { x: cell.x, y: cell.y, location: cell.name },
      memberChanges: [{ id: 2, energy: -10 }],
      result: 'success'
    });
    
    setTimeout(() => {
      cell.explored = true;
      
      const random = Math.random();
      if (random < 0.3) {
        const foodGain = Math.floor(Math.random() * 20) + 10;
        resources.value.food += foodGain;
        
        battleLogStore.addAction({
          name: '探索发现食物',
          type: 'explore',
          description: `探索${cell.name}发现了食物！`,
          resourceChanges: { food: foodGain },
          mapChange: { x: cell.x, y: cell.y, location: cell.name },
          result: 'success'
        });
        
        ElMessage.success(`探索发现了食物！获得${foodGain}食物`);
      } else if (random < 0.6) {
        const woodGain = Math.floor(Math.random() * 15) + 5;
        resources.value.wood += woodGain;
        
        battleLogStore.addAction({
          name: '探索发现木材',
          type: 'explore',
          description: `探索${cell.name}发现了木材！`,
          resourceChanges: { wood: woodGain },
          mapChange: { x: cell.x, y: cell.y, location: cell.name },
          result: 'success'
        });
        
        ElMessage.success(`探索发现了木材！获得${woodGain}木材`);
      } else if (random < 0.8) {
        const stoneGain = Math.floor(Math.random() * 10) + 5;
        resources.value.stone += stoneGain;
        
        battleLogStore.addAction({
          name: '探索发现石头',
          type: 'explore',
          description: `探索${cell.name}发现了石头！`,
          resourceChanges: { stone: stoneGain },
          mapChange: { x: cell.x, y: cell.y, location: cell.name },
          result: 'success'
        });
        
        ElMessage.success(`探索发现了石头！获得${stoneGain}石头`);
      } else {
        resources.value.food -= 10;
        resources.value.water -= 10;
        
        battleLogStore.addAction({
          name: '探索遇到危险',
          type: 'explore',
          description: `探索${cell.name}遇到了危险！`,
          resourceChanges: { food: -10, water: -10 },
          mapChange: { x: cell.x, y: cell.y, location: cell.name },
          memberChanges: [{ id: 1, health: -10 }, { id: 2, health: -5 }],
          result: 'fail'
        });
        
        ElMessage.warning('探索遇到了危险！损失了10食物和10水');
      }
    }, 5000);
  }).catch(() => {
    addMessage('取消了探索');
  });
};

onMounted(() => {
  battleLogStore.addAction({
    name: '游戏启动',
    type: 'system',
    description: '欢迎来到海岛生存游戏！',
    result: 'success'
  });
  
  setInterval(() => {
    resources.value.food -= 5;
    resources.value.water -= 5;
    
    battleLogStore.addAction({
      name: '资源消耗',
      type: 'consume',
      description: '生存消耗了食物和水',
      resourceChanges: { food: -5, water: -5 },
      memberChanges: [{ id: 1, energy: -2 }, { id: 2, energy: -2 }],
      result: 'success'
    });
    
    if (resources.value.food <= 0 || resources.value.water <= 0) {
      ElMessageBox.alert(
        '你的食物或水耗尽了，游戏结束！',
        '游戏结束',
        {
          confirmButtonText: '重新开始',
          type: 'error'
        }
      ).then(() => {
        resources.value.food = 100;
        resources.value.water = 100;
        resources.value.wood = 100;
        resources.value.stone = 100;
        battleLogStore.clearAll();
        addMessage('重新开始游戏！');
      });
    }
  }, 60000);
});
</script>

<style scoped>
.island-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.island-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.island-header h1 {
  font-size: 48px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.island-header p {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}

.island-main {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.member-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.member-panel h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.member-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.member-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.member-avatar {
  font-size: 40px;
  margin-right: 16px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.member-status-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 12px;
  color: #666;
  min-width: 50px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.health {
  background: linear-gradient(90deg, #f56c6c, #67c23a);
}

.progress-fill.energy {
  background: linear-gradient(90deg, #e6a23c, #409eff);
}

.status-value {
  font-size: 12px;
  color: #666;
  min-width: 30px;
  text-align: right;
}

.member-status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.member-status-tag.healthy {
  background: #f0f9eb;
  color: #67c23a;
}

.member-status-tag.tired {
  background: #fdf6ec;
  color: #e6a23c;
}

.member-status-tag.injured {
  background: #fef0f0;
  color: #f56c6c;
}

.member-status-tag.sick {
  background: #ecf5ff;
  color: #409eff;
}

.actions-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.actions-panel h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.action-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.action-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.action-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.action-time,
.action-cost {
  font-size: 12px;
  color: #999;
}

.map-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-panel h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.map-container {
  text-align: center;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.map-cell {
  width: 100px;
  height: 100px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #ddd;
  position: relative;
}

.map-cell:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.map-cell.explored {
  background: #e8f4fa;
  border-color: #409eff;
}

.map-cell.current {
  border-color: #67c23a;
  box-shadow: 0 0 12px rgba(103, 194, 58, 0.5);
}

.map-cell.current::after {
  content: '📍';
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 20px;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-icon {
  font-size: 24px;
}

.current-position {
  display: inline-block;
  padding: 8px 16px;
  background: #f0f9eb;
  color: #67c23a;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.battle-log-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-header h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.tab-switcher {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.tab-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.panel-content {
  min-height: 400px;
}

.chains-view .chain-controls {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.chains-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chain-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.chain-item:hover {
  border-color: #409eff;
  background: #f5faff;
}

.chain-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.chain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chain-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chain-icon {
  font-size: 20px;
}

.chain-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.chain-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.chain-description {
  font-size: 13px;
  color: #666;
  padding: 8px 0;
}

.chain-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e9ecef;
}

.action-detail-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.action-detail-item:last-child {
  border-bottom: none;
}

.action-time-badge {
  padding: 4px 8px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  height: fit-content;
  white-space: nowrap;
}

.action-detail-content {
  flex: 1;
}

.action-detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.action-type-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}

.action-type-tag.gather {
  background: #f0f9eb;
  color: #67c23a;
}

.action-type-tag.build {
  background: #ecf5ff;
  color: #409eff;
}

.action-type-tag.explore {
  background: #fdf6ec;
  color: #e6a23c;
}

.action-type-tag.craft {
  background: #fef0f0;
  color: #f56c6c;
}

.action-type-tag.consume {
  background: #f4f4f5;
  color: #909399;
}

.action-type-tag.system {
  background: #f0f0f0;
  color: #606266;
}

.action-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.action-result {
  margin-left: auto;
}

.action-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.resource-changes,
.map-change,
.member-changes {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.changes-label {
  font-size: 12px;
  color: #999;
}

.change-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.change-tag.positive {
  background: #f0f9eb;
  color: #67c23a;
}

.change-tag.negative {
  background: #fef0f0;
  color: #f56c6c;
}

.change-tag.info {
  background: #ecf5ff;
  color: #409eff;
}

.timeline-view .timeline-list {
  position: relative;
  padding-left: 24px;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dcdfe6;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #e9ecef;
}

.timeline-dot.gather {
  background: #67c23a;
  box-shadow: 0 0 0 2px #e1f3d8;
}

.timeline-dot.build {
  background: #409eff;
  box-shadow: 0 0 0 2px #d9ecff;
}

.timeline-dot.explore {
  background: #e6a23c;
  box-shadow: 0 0 0 2px #faecd8;
}

.timeline-dot.craft {
  background: #f56c6c;
  box-shadow: 0 0 0 2px #fde2e2;
}

.timeline-dot.consume {
  background: #909399;
  box-shadow: 0 0 0 2px #e9e9eb;
}

.timeline-dot.system {
  background: #606266;
  box-shadow: 0 0 0 2px #e4e7ed;
}

.timeline-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.timeline-time {
  font-size: 12px;
  color: #409eff;
  font-weight: bold;
}

.timeline-chain {
  font-size: 12px;
  color: #999;
}

.timeline-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.timeline-resources {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.resource-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.resource-badge.gain {
  background: #f0f9eb;
  color: #67c23a;
}

.resource-badge.lose {
  background: #fef0f0;
  color: #f56c6c;
}

.legacy-view .log-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
}

.log-item {
  display: flex;
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.log-time {
  font-weight: bold;
  color: #409eff;
  margin-right: 12px;
  min-width: 70px;
}

.log-content {
  flex: 1;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .island-header h1 {
    font-size: 32px;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .member-list {
    grid-template-columns: 1fr;
  }
}
</style>
