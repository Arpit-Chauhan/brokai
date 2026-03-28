import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createTaskSchema, updateTaskSchema } from '../schema/taskSchema';
import { io } from '../index';

const prisma = new PrismaClient();

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createTaskSchema.parse(req.body);

        const task = await prisma.task.create({
            data: {
                title: validatedData.title,
                location: validatedData.location,
                status: validatedData.status || 'Pending',
            },
        });

        // Broadcast change directly to Web and Mobile instantly!
        io.emit('task_created', task);

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = updateTaskSchema.parse(req.body);

        const task = await prisma.task.update({
            where: { id },
            data: {
                status: validatedData.status,
            },
        });

        // Broadcast change directly to Web and Mobile instantly!
        const source = req.body.source || 'engineer';
        io.emit('task_completed', { ...task, source });

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};
