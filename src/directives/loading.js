import { createApp, h } from 'vue';
import { ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

const INSTANCE_KEY = Symbol('loading');

const createLoadingComponent = (el, binding) => {
  const loadingText = binding.value?.text || '加载中...';
  const background = binding.value?.background || 'rgba(255, 255, 255, 0.9)';

  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${background};
    z-index: 1000;
  `;

  const iconDiv = document.createElement('div');
  iconDiv.style.cssText = `
    font-size: 32px;
    color: #409eff;
    animation: rotate 1.5s linear infinite;
  `;

  const textDiv = document.createElement('div');
  textDiv.style.cssText = `
    margin-top: 12px;
    color: #606266;
    font-size: 14px;
  `;
  textDiv.textContent = loadingText;

  // Create icon using Vue component
  const iconApp = createApp({
    render() {
      return h(ElIcon, { size: 32 }, () => h(Loading));
    }
  });
  iconApp.mount(iconDiv);

  loadingDiv.appendChild(iconDiv);
  loadingDiv.appendChild(textDiv);

  // Add keyframes for rotation
  if (!document.getElementById('loading-keyframes')) {
    const style = document.createElement('style');
    style.id = 'loading-keyframes';
    style.textContent = `
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  return { loadingDiv, iconApp };
};

export default {
  mounted(el, binding) {
    if (binding.value === true || (typeof binding.value === 'object' && binding.value.show)) {
      el.style.position = el.style.position || 'relative';
      const { loadingDiv, iconApp } = createLoadingComponent(el, binding);
      el[INSTANCE_KEY] = { loadingDiv, iconApp };
      el.appendChild(loadingDiv);
    }
  },
  updated(el, binding) {
    const instance = el[INSTANCE_KEY];
    const shouldShow = binding.value === true || (typeof binding.value === 'object' && binding.value.show);

    if (shouldShow && !instance) {
      el.style.position = el.style.position || 'relative';
      const { loadingDiv, iconApp } = createLoadingComponent(el, binding);
      el[INSTANCE_KEY] = { loadingDiv, iconApp };
      el.appendChild(loadingDiv);
    } else if (!shouldShow && instance) {
      instance.iconApp.unmount();
      el.removeChild(instance.loadingDiv);
      delete el[INSTANCE_KEY];
    }
  },
  unmounted(el) {
    const instance = el[INSTANCE_KEY];
    if (instance) {
      instance.iconApp.unmount();
      if (instance.loadingDiv.parentNode) {
        el.removeChild(instance.loadingDiv);
      }
      delete el[INSTANCE_KEY];
    }
  }
};
