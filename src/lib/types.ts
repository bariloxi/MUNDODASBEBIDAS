import { Prisma } from '@prisma/client';

export type Product = Prisma.ProductGetPayload<object>;
export type Category = Prisma.CategoryGetPayload<object>;
export type Client = Prisma.ClientGetPayload<object>;
export type User = Prisma.UserGetPayload<object>;

export type SaleItemWithProduct = Prisma.SaleItemGetPayload<{
  include: { product: true }
}>;

export type InvoiceWithSale = {
  id: number;
  number: string;
  accessKey: string;
  saleId: number;
  createdAt: Date;
  updatedAt: Date;
  sale: SaleWithRelations;
};

export type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    client: true;
    user: true;
    items: {
      include: { product: true }
    };
  }
}> & {
  invoice?: {
    id: number;
    number: string;
    accessKey: string;
    saleId: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};
