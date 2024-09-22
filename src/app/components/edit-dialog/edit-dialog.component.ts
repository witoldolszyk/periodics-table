import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.css']
})
export class EditDialogComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { label: string, value: any },
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      value: [
        this.data.value,
        [Validators.required, ...this.getCustomValidator()]
      ]
    });
  }

  getCustomValidator(): ValidatorFn[] {
    if (this.data.label === 'Position' || this.data.label === 'Number') {
      return [Validators.pattern('^[0-9]*$')]; 
    } else if (this.data.label === 'Weight') {
      return [Validators.pattern('^[0-9]+(\\.[0-9]+)?$')]; 
    }
    return [];
  }

  getErrorMessage(): string {
    if (this.data.label === 'Number' || this.data.label === 'Position') {
      return 'Only integers are allowed.';
    } else if (this.data.label === 'Weight') {
      return 'Only decimal numbers are allowed.';
    } else {
      return 'Invalid input.';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.get('value')?.value);
    }
  }
}
