import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ItemRequest {
  sku: string;
  name: string;
  description?: string | null;
  unitOfMeasure: string;
  reorderPoint: number;
  reorderQuantity: number;
  active?: boolean | null;
}

export interface ItemResponse extends ItemRequest {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRequest {
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  active?: boolean | null;
}

export interface WarehouseResponse extends WarehouseRequest {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLevelResponse {
  inventoryId: string;
  itemId: string;
  warehouseId: string;
  itemSku: string;
  itemName: string;
  warehouseCode: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export type StockMovementType =
  | 'RECEIVE'
  | 'CONSUME'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface StockMovementRequest {
  itemId: string;
  warehouseId: string;
  movementType: StockMovementType;
  quantity: number;
  reference?: string | null;
  reason?: string | null;
}

export interface StockMovementResponse {
  id: string;
  itemId: string;
  warehouseId: string;
  movementType: StockMovementType;
  quantity: number;
  reference: string | null;
  reason: string | null;
  occurredAt: string;
}

export interface StockTransferRequest {
  itemId: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  quantity: number;
  reason?: string | null;
}

export interface StockTransferResponse {
  outbound: StockMovementResponse;
  inbound: StockMovementResponse;
}

export interface MovementFilters {
  itemId?: string | null;
  warehouseId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/inventory`;

  listItems(page = 0, size = 20) {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PagedResponse<ItemResponse>>(`${this.base}/items`, { params });
  }

  createItem(payload: ItemRequest) {
    return this.http.post<ItemResponse>(`${this.base}/items`, payload);
  }

  updateItem(id: string, payload: ItemRequest) {
    return this.http.put<ItemResponse>(`${this.base}/items/${id}`, payload);
  }

  deactivateItem(id: string) {
    return this.http.delete<void>(`${this.base}/items/${id}`);
  }

  listWarehouses(page = 0, size = 20) {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PagedResponse<WarehouseResponse>>(`${this.base}/warehouses`, { params });
  }

  createWarehouse(payload: WarehouseRequest) {
    return this.http.post<WarehouseResponse>(`${this.base}/warehouses`, payload);
  }

  updateWarehouse(id: string, payload: WarehouseRequest) {
    return this.http.put<WarehouseResponse>(`${this.base}/warehouses/${id}`, payload);
  }

  deactivateWarehouse(id: string) {
    return this.http.delete<void>(`${this.base}/warehouses/${id}`);
  }

  getInventoryByItem(itemId: string) {
    return this.http.get<InventoryLevelResponse[]>(`${this.base}/items/${itemId}`);
  }

  getInventoryByWarehouse(warehouseId: string) {
    return this.http.get<InventoryLevelResponse[]>(`${this.base}/warehouses/${warehouseId}`);
  }

  getMovements(filters: MovementFilters = {}, page = 0, size = 20) {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filters.itemId) {
      params = params.set('itemId', filters.itemId);
    }
    if (filters.warehouseId) {
      params = params.set('warehouseId', filters.warehouseId);
    }
    return this.http.get<PagedResponse<StockMovementResponse>>(`${this.base}/movements`, { params });
  }

  registerMovement(payload: StockMovementRequest) {
    return this.http.post<StockMovementResponse>(`${this.base}/movements`, payload);
  }

  transferStock(payload: StockTransferRequest) {
    return this.http.post<StockTransferResponse>(`${this.base}/transfers`, payload);
  }
}
