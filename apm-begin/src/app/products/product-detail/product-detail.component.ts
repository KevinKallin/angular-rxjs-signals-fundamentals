import {Component, inject, Input} from '@angular/core';

import {NgIf, NgFor, CurrencyPipe, AsyncPipe} from '@angular/common';
import { Product } from '../product';
import {ProductService} from "../product.service";
import {catchError, EMPTY, Subscription, tap} from "rxjs";

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe]
})
export class ProductDetailComponent {
  errorMessage = '';

  private productService = inject(ProductService);

  // Product to display
  product$ = this.productService.product$
    .pipe(
      catchError(error => {
        this.errorMessage = error;
        return EMPTY;
      }));

  // Set the page title
  //pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';
  pageTitle = 'ProductDetailt';

  sub!: Subscription;
  //

  addToCart(product: Product) {
  }
}
