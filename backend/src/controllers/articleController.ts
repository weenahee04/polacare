import { Response, NextFunction, Request } from 'express';
import prisma from '../config/prisma';

export const getArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const where: any = {
      isPublished: true
    };

    if (category) {
      where.category = category;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          category: true,
          imageUrl: true,
          excerpt: true,
          readTime: true,
          publishedAt: true,
          viewCount: true
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { publishedAt: 'desc' }
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      articles,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findFirst({
      where: {
        id,
        isPublished: true
      }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Increment view count
    await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

export const getArticleCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.article.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category']
    });

    res.json({
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        category: true,
        imageUrl: true,
        excerpt: true,
        readTime: true,
        viewCount: true
      },
      take: parseInt(limit as string),
      orderBy: { viewCount: 'desc' }
    });

    res.json({ articles });
  } catch (error) {
    next(error);
  }
};
