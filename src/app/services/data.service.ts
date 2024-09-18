import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PeriodicElement } from '../models/periodic-element.model';
import { ELEMENT_DATA } from '../data/element-data';  

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  getPeriodicElements(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(delay(500));
  }
}
