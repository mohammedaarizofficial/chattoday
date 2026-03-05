import express from 'express'
import { createUser } from '../controllers/users.controllers.js';

const router = express.Router();

router.post('/', createUser);

export default router;

