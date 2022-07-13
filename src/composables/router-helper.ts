// TODO: This helper can be removed once
// vue-router either releases a new version, or we update to vue3.
import { getCurrentInstance } from 'vue';

export function useRoute() {
  const inst = getCurrentInstance();
  if (!inst) {
    throw new Error('No current instance found');
  }
  const { proxy } = inst;
  return proxy.$route;
}
export function useRouter() {
  const inst = getCurrentInstance();
  if (!inst) {
    throw new Error('No current instance found');
  }
  const { proxy } = inst;
  return proxy.$router;
}
