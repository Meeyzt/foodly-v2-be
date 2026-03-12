import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Authz } from '../../common/authz/authz.decorator';
import { AuthzGuard } from '../../common/authz/authz.guard';
import { BRANCH_ROLES } from '../../common/authz/rbac.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MenuManagementService } from './menu-management.service';

@Controller('staff/branches/:branchId')
@UseGuards(JwtAuthGuard, AuthzGuard)
@Authz({
  branchParam: 'branchId',
  roles: [BRANCH_ROLES.BUSINESS_ADMIN, BRANCH_ROLES.BRANCH_MANAGER],
})
export class MenuManagementController {
  constructor(private readonly menuManagementService: MenuManagementService) {}

  @Get('menus')
  listMenus(@Param('branchId') branchId: string) {
    return this.menuManagementService.listMenus(branchId);
  }

  @Post('menus')
  createMenu(@Param('branchId') branchId: string, @Body() dto: CreateMenuDto) {
    return this.menuManagementService.createMenu(branchId, dto);
  }

  @Patch('menus/:menuId')
  updateMenu(
    @Param('branchId') branchId: string,
    @Param('menuId') menuId: string,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menuManagementService.updateMenu(branchId, menuId, dto);
  }

  @Delete('menus/:menuId')
  deleteMenu(@Param('branchId') branchId: string, @Param('menuId') menuId: string) {
    return this.menuManagementService.deleteMenu(branchId, menuId);
  }

  @Get('categories')
  listCategories(@Param('branchId') branchId: string) {
    return this.menuManagementService.listCategories(branchId);
  }

  @Post('categories')
  createCategory(@Param('branchId') branchId: string, @Body() dto: CreateCategoryDto) {
    return this.menuManagementService.createCategory(branchId, dto);
  }

  @Patch('categories/:categoryId')
  updateCategory(
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuManagementService.updateCategory(branchId, categoryId, dto);
  }

  @Delete('categories/:categoryId')
  deleteCategory(
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.menuManagementService.deleteCategory(branchId, categoryId);
  }

  @Get('products')
  listProducts(@Param('branchId') branchId: string) {
    return this.menuManagementService.listProducts(branchId);
  }

  @Post('products')
  createProduct(@Param('branchId') branchId: string, @Body() dto: CreateProductDto) {
    return this.menuManagementService.createProduct(branchId, dto);
  }

  @Patch('products/:productId')
  updateProduct(
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.menuManagementService.updateProduct(branchId, productId, dto);
  }

  @Delete('products/:productId')
  deleteProduct(@Param('branchId') branchId: string, @Param('productId') productId: string) {
    return this.menuManagementService.deleteProduct(branchId, productId);
  }
}
