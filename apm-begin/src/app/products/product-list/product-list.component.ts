import {Component, inject, OnDestroy, OnInit} from '@angular/core';

import {NgIf, NgFor, NgClass, AsyncPipe} from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import {ProductService} from "../product.service";
import {catchError, EMPTY, Subscription, tap} from "rxjs";

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent, AsyncPipe]
})
export class ProductListComponent {
  pageTitle = 'Products';

  private productService = inject(ProductService);

  products = this.productService.products;
  errorMessage = this.productService.productsError;
  // Selected product id to highlight the entry
  selectedProductId = this.productService.selectedProductId;

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
