// TODO: This helper can be removed once
// vue-router either releases a new version, or we update to vue3.
import {
  // effectScope,
  getCurrentInstance,
  reactive,
} from 'vue';

import { Route } from 'vue-router';

let currentRoute: Route;

function assign(target: Record<string, any>, source: Record<string, any>) {
  for (const key of Object.keys(source)) {
    target[key] = source[key];
  }
  return target;
}

export function useRoute(): Route {
  const inst = getCurrentInstance();
  if (!inst) {
    return undefined as any;
  }
  if (!currentRoute) {
    // const scope = effectScope(true);
    // scope.run(() => {
    //   const { $router } = inst.proxy;
    //   currentRoute = reactive(assign({}, $router.currentRoute)) as any;
    //   $router.afterEach((to) => {
    //     assign(currentRoute, to);
    //   });
    // });
  }
  return currentRoute;
}
export function useRouter() {
  const inst = getCurrentInstance();
  if (!inst) {
    throw new Error('No current instance found');
  }
  const { proxy } = inst;
  return proxy.$router;
}
