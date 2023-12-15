import {computed, inject, Injectable, signal} from '@angular/core';
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
import {Product, Result} from "./product";
import {ProductData} from "./product-data";
import {HttpErrorService} from "../utilities/http-error.service";
import {ReviewService} from "../reviews/review.service";
import {Review} from "../reviews/review";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService)

  selectedProductId = signal<number | undefined>(undefined);

  private productsResult$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(p => ({data: p} as Result<Product[]>)),
      tap(p => console.log(JSON.stringify(p))),
      shareReplay(1),
      catchError(err => of({data: [], error: this.errorService.formatError(err)} as Result<Product[]>))
    );

 private productsResult = toSignal(this.productsResult$,
    {initialValue: ({data: []} as Result<Product[]>)})

  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);

  private productResult$ = combineLatest([
    toObservable(this.selectedProductId),
    toObservable(this.products)
  ]).pipe(
    map(([selectedProductId, products]) =>
      products?.find(product => product.id === selectedProductId)),
    filter(Boolean),
    switchMap(product => this.getProductWithReviews(product)),
    catchError(err => of({
      data: undefined,
      error: this.errorService.formatError(err)
    } as Result<Product>)),
    map(p => ({data: p} as Result<Product>))
  )

  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);


  productSelected(selectedProductId: number): void{
    this.selectedProductId.set(selectedProductId);
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

}
