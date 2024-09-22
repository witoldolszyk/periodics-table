import { Component } from '@angular/core';
import { PeriodicElement } from '../../models/periodic-element.model';
import { DataService } from '../../services/data.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common'; 
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RxState } from '@rx-angular/state';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule, 
    EditDialogComponent, 
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  providers: [RxState],
  templateUrl: './periodic-table.component.html',
  styleUrls: ['./periodic-table.component.css']
})
export class PeriodicTableComponent {

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  filter$ = new Subject<string>();
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  loading = true;

  constructor(
    private dataService: DataService, 
    public dialog: MatDialog, 
    private state: RxState<{ elements: PeriodicElement[], filter: string }>
  ) {}

  ngOnInit(): void {
    this.state.connect('filter', this.filter$.pipe(debounceTime(2000)));
    this.state.connect('elements', this.dataService.getPeriodicElements());
  
    this.state.select().subscribe(({ elements, filter }) => {
      this.loading = false;
      this.dataSource.data = this.applyFilter(elements, filter);
    });
  }

  onInputChange(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.filter$.next(filterValue);
  }

  applyFilter(elements: PeriodicElement[], filter: string): PeriodicElement[] {
    if (!filter) {
      return elements;
    }
    return elements.filter(element => 
      element.name.includes(filter) ||
      element.symbol.includes(filter) ||
      element.position.toString().includes(filter) ||
      element.weight.toString().includes(filter)
    );
  }

  openEditDialog(element: PeriodicElement, label: string, value: any, key: keyof PeriodicElement): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '250px',
      data: { label, value }
    });

    this.state.hold(dialogRef.afterClosed(), (result) => {
      if (result !== undefined) {
        const updatedElement = { ...element, [key]: result };
        const updatedElements = [...this.state.get('elements')];
        const index = updatedElements.findIndex(e => e.position === element.position);
        if (index !== -1) {
          updatedElements[index] = updatedElement;
          this.state.set({ elements: updatedElements });
        }
      }
    });
  }
}
