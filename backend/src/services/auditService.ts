/**
 * Audit Service
 * 
 * Tracks all changes to resources for compliance and debugging.
 */

import { AuditAction } from '@prisma/client';
import prisma from '../config/prisma';
import logger from '../config/logger';

interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export const createAuditLog = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent
      }
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    logger.error('Failed to create audit log', { error, entry });
  }
};

/**
 * Log case creation
 */
export const logCaseCreated = async (
  userId: string,
  caseId: string,
  details: Record<string, any>,
  ipAddress?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    action: 'CREATE',
    resourceType: 'PatientCase',
    resourceId: caseId,
    details,
    ipAddress
  });
};

/**
 * Log case update
 */
export const logCaseUpdated = async (
  userId: string,
  caseId: string,
  changes: Record<string, any>,
  ipAddress?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    action: 'UPDATE',
    resourceType: 'PatientCase',
    resourceId: caseId,
    details: { changes },
    ipAddress
  });
};

/**
 * Log case status change
 */
export const logCaseStatusChange = async (
  userId: string,
  caseId: string,
  oldStatus: string,
  newStatus: string,
  ipAddress?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    action: 'UPDATE',
    resourceType: 'PatientCase',
    resourceId: caseId,
    details: { statusChange: { from: oldStatus, to: newStatus } },
    ipAddress
  });
};

/**
 * Log image upload
 */
export const logImageUploaded = async (
  userId: string,
  imageId: string,
  caseId: string,
  ipAddress?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    action: 'CREATE',
    resourceType: 'CaseImage',
    resourceId: imageId,
    details: { caseId },
    ipAddress
  });
};

/**
 * Log image deletion
 */
export const logImageDeleted = async (
  userId: string,
  imageId: string,
  caseId: string,
  ipAddress?: string
): Promise<void> => {
  await createAuditLog({
    userId,
    action: 'DELETE',
    resourceType: 'CaseImage',
    resourceId: imageId,
    details: { caseId },
    ipAddress
  });
};

/**
 * Get audit logs for a resource
 */
export const getAuditLogsForResource = async (
  resourceType: string,
  resourceId: string
): Promise<any[]> => {
  const logs = await prisma.auditLog.findMany({
    where: {
      resourceType,
      resourceId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          hn: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return logs.map(log => ({
    id: log.id,
    userId: log.userId,
    userName: log.user?.name,
    userRole: log.user?.role,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    details: log.details ? JSON.parse(log.details) : null,
    createdAt: log.createdAt
  }));
};

/**
 * Get all audit logs with pagination
 */
export const getAuditLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<{ logs: any[]; total: number; page: number; limit: number }> => {
  const where: any = {};

  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = filters.action;
  if (filters?.resourceType) where.resourceType = filters.resourceType;
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            hn: true,
            role: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    logs: logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.name,
      userRole: log.user?.role,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      details: log.details ? JSON.parse(log.details) : null,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt
    })),
    total,
    page,
    limit
  };
};

