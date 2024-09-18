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
  templateUrl: './periodic-table.component.html',
  styleUrls: ['./periodic-table.component.css']
})
export class PeriodicTableComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  loading = true;

  private filterSubject = new Subject<string>();

  constructor(private dataService: DataService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataService.getPeriodicElements().subscribe((data) => {
      this.dataSource.data = data;
      this.loading = false;
    });

    this.filterSubject.pipe(
      debounceTime(2000) 
    ).subscribe((filterValue: string) => {
      this.applyFilter(filterValue);
    });

    this.dataSource.filterPredicate = (data: PeriodicElement, filter: string) => {
      const searchTerm = filter.trim();
      return (
        data.name.includes(searchTerm) ||
        data.symbol.includes(searchTerm) ||
        data.weight.toString().includes(searchTerm) ||
        data.position.toString().includes(searchTerm)
      );
    };
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim(); 
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filterSubject.next(inputElement.value);
  }

  openEditDialog(element: PeriodicElement, label: string, value: any, key: keyof PeriodicElement): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '250px',
      data: { label, value }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const updatedElement = { ...element, [key]: result };
        const index = this.dataSource.data.findIndex(e => e.position === element.position);
        if (index !== -1) {
          this.dataSource.data[index] = updatedElement;
          this.dataSource.data = [...this.dataSource.data]; 
        }
      }
    });
  }
}
