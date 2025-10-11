<template>
  <div class="avatar-display" :class="sizeClass">
    <img 
      v-if="avatarUrl" 
      :src="fullAvatarUrl" 
      :alt="name"
      class="avatar-image"
      @error="handleImageError"
    />
    <div v-else class="avatar-placeholder" :style="{ backgroundColor: avatarColor }">
      <span class="avatar-initials">{{ initials }}</span>
    </div>
    <div v-if="showStatus" class="status-indicator" :class="statusClass"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  avatarUrl?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: null,
  size: 'md',
  showStatus: false,
  status: 'offline'
});

const imageError = ref(false);

const fullAvatarUrl = computed(() => {
  if (!props.avatarUrl || imageError.value) return undefined;
  if (props.avatarUrl.startsWith('http')) return props.avatarUrl;
  return `http://localhost:3000${props.avatarUrl}`;
});

const initials = computed(() => {
  const names = props.name.split(' ');
  if (names.length >= 2 && names[0] && names[1]) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return props.name.substring(0, 2).toUpperCase();
});

const avatarColor = computed(() => {
  // Generate a consistent color based on the name
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
    '#10b981', '#06b6d4', '#6366f1', '#f43f5e'
  ];
  const index = props.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
});

const sizeClass = computed(() => `avatar-${props.size}`);

const statusClass = computed(() => `status-${props.status}`);

const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.avatar-display {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-initials {
  color: white;
  font-weight: 600;
}

/* Size variants */
.avatar-xs {
  width: 24px;
  height: 24px;
}

.avatar-xs .avatar-initials {
  font-size: 10px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-sm .avatar-initials {
  font-size: 12px;
}

.avatar-md {
  width: 40px;
  height: 40px;
}

.avatar-md .avatar-initials {
  font-size: 14px;
}

.avatar-lg {
  width: 56px;
  height: 56px;
}

.avatar-lg .avatar-initials {
  font-size: 18px;
}

.avatar-xl {
  width: 80px;
  height: 80px;
}

.avatar-xl .avatar-initials {
  font-size: 24px;
}

/* Status indicator */
.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid white;
}

.status-online {
  background-color: #10b981;
}

.status-offline {
  background-color: #6b7280;
}

.status-away {
  background-color: #f59e0b;
}
</style>
