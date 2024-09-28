import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Corbado from '@corbado/web-js';

export const authGuard: CanActivateFn = async (route, state) => {

  const router = inject(Router)
  await Corbado.load({
    projectId: "pro-0317338422706138772",
    darkMode: 'off',
});
  if (!Corbado.isAuthenticated) {
    console.info('Access denied...')
    router.navigate(['']);
    return false;
  }
  return true;
};
