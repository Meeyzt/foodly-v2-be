import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class MenuManagementService {
  constructor(private readonly prisma: PrismaService) {}

  listMenus(branchId: string) {
    return this.prisma.menu.findMany({
      where: { restaurant: { branches: { some: { id: branchId } } } },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createMenu(branchId: string, dto: CreateMenuDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { restaurantId: true },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.menu.create({
      data: {
        restaurantId: branch.restaurantId,
        name: dto.name,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateMenu(branchId: string, menuId: string, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findFirst({
      where: { id: menuId, restaurant: { branches: { some: { id: branchId } } } },
      select: { id: true, isActive: true, restaurantId: true },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found for branch');
    }

    if (dto.isActive === false && menu.isActive) {
      await this.ensureRestaurantHasAnotherActiveMenu(menu.restaurantId, menu.id);
    }

    return this.prisma.menu.update({ where: { id: menuId }, data: dto });
  }

  async deleteMenu(branchId: string, menuId: string) {
    const menu = await this.prisma.menu.findFirst({
      where: { id: menuId, restaurant: { branches: { some: { id: branchId } } } },
      select: { id: true, isActive: true, restaurantId: true },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found for branch');
    }

    if (menu.isActive) {
      await this.ensureRestaurantHasAnotherActiveMenu(menu.restaurantId, menu.id);
    }

    try {
      return await this.prisma.menu.delete({ where: { id: menuId } });
    } catch {
      throw new BadRequestException('Menu cannot be deleted while it has categories');
    }
  }

  listCategories(branchId: string) {
    return this.prisma.category.findMany({
      where: { branchId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createCategory(branchId: string, dto: CreateCategoryDto) {
    const menu = await this.prisma.menu.findFirst({
      where: { id: dto.menuId, restaurant: { branches: { some: { id: branchId } } } },
      select: { id: true },
    });

    if (!menu) {
      throw new BadRequestException('Menu is not accessible from this branch');
    }

    return this.prisma.category.create({
      data: {
        branchId,
        menuId: dto.menuId,
        name: dto.name,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async updateCategory(branchId: string, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, branchId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found for branch');
    }

    return this.prisma.category.update({ where: { id: categoryId }, data: dto });
  }

  async deleteCategory(branchId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, branchId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found for branch');
    }

    try {
      return await this.prisma.category.delete({ where: { id: categoryId } });
    } catch {
      throw new BadRequestException('Category cannot be deleted while it has products');
    }
  }

  listProducts(branchId: string) {
    return this.prisma.product.findMany({
      where: { branchId },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    });
  }

  async createProduct(branchId: string, dto: CreateProductDto) {
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, branchId },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException('Category is not accessible from this branch');
    }

    return this.prisma.product.create({
      data: {
        branchId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateProduct(branchId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, branchId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found for branch');
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, branchId },
        select: { id: true },
      });
      if (!category) {
        throw new BadRequestException('Target category is not accessible from this branch');
      }
    }

    return this.prisma.product.update({ where: { id: productId }, data: dto });
  }

  async assignProductCategory(branchId: string, productId: string, categoryId: string) {
    return this.updateProduct(branchId, productId, { categoryId });
  }

  async deleteProduct(branchId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, branchId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found for branch');
    }

    return this.prisma.product.delete({ where: { id: productId } });
  }

  private async ensureRestaurantHasAnotherActiveMenu(restaurantId: string, currentMenuId: string) {
    const activeMenuCount = await this.prisma.menu.count({
      where: {
        restaurantId,
        isActive: true,
        NOT: { id: currentMenuId },
      },
    });

    if (activeMenuCount === 0) {
      throw new BadRequestException('At least one active menu must remain');
    }
  }
}
