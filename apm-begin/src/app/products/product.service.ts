import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {
  BehaviorSubject,
  catchError, combineLatest,
  combineLatestAll,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError
} from "rxjs";
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

  private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  readonly productSelected$ = this.productSelectedSubject.asObservable();

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(p => console.log(JSON.stringify(p))),
      shareReplay(1),
      catchError(err => this.handleError(err))
    );

  product$ = combineLatest([
    this.productSelected$,
    this.products$
  ]).pipe(
    map(([selectedProductId, products]) =>
    products.find(product => product.id === selectedProductId)),
    filter(Boolean),
    switchMap(product => this.getProductWithReviews(product)),
    catchError(err => this.handleError(err))

  )

  productSelected(selectedProductId: number): void{
    this.productSelectedSubject.next(selectedProductId);
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
