import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, map, Observable, of, shareReplay, switchMap, tap, throwError} from "rxjs";
import {Product} from "./product";
import {ProductData} from "./product-data";
import {HttpErrorService} from "../utilities/http-error.service";
import {ReviewService} from "../reviews/review.service";
import {Review} from "../reviews/review";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService)

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(p => console.log(JSON.stringify(p))),
      shareReplay(1),
      catchError(err => this.handleError(err))
    );

  getProduct(id: number){
    const productUrl = `${this.productsUrl}/${id}`;
    return this.http.get<Product>(productUrl)
      .pipe(
        tap(() => console.log('In http get by id pipeline')),
        switchMap(product => this.getProductWithReviews(product)),
        catchError(err => this.handleError(err))
      );

  }

private getProductWithReviews(product: Product){
    if(product.hasReviews){
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          map(reviews => ({...product, reviews}))
        )
    } else {
      return of(product);
    }
}

  private handleError(error: HttpErrorResponse){
    const formattedMessage = this.errorService.formatError(error);
    return throwError(() => formattedMessage);
  }
}
