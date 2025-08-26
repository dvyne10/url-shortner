import { Router } from 'express';
import { shortenUrl, redirectToOriginalUrl } from '../controllers/urlController';

export function createUrlRoutes(): Router {
  const router = Router();

  router.post('/url', shortenUrl);
  
  router.get('/:code', redirectToOriginalUrl);

  return router;
}