import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: string; // "INCOME" or "EXPENSE"
  category: string; // "Food", "Rent", "Salary", "Entertainment"
  date: string; // YYYY-MM-DD
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit {
  protected readonly title = signal('Finance Tracker');
  transactions = signal<Transaction[]>([]);

  // Form model
  newTransaction: Transaction = {
    description: '',
    amount: 0,
    type: 'EXPENSE',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  };

  private apiUrl = 'http://localhost:8080/api/transactions';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.http.get<Transaction[]>(this.apiUrl)
      .subscribe({
        next: (data) => {
          this.transactions.set(data);
        },
        error: (error) => {
          console.error('Error fetching transactions:', error);
        }
      });
  }

  submitTransaction() {
    // Validate simple inputs
    if (!this.newTransaction.description || this.newTransaction.amount <= 0) {
      alert('Please enter a valid description and positive amount.');
      return;
    }

    this.http.post<Transaction>(this.apiUrl, this.newTransaction)
      .subscribe({
        next: () => {
          this.loadTransactions();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
        }
      });
  }

  deleteTx(id?: number) {
    if (id === undefined) return;

    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
        }
      });
  }

  getTotalIncome(): number {
    return this.transactions()
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getTotalExpenses(): number {
    return this.transactions()
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getNetBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  private resetForm() {
    this.newTransaction = {
      description: '',
      amount: 0,
      type: 'EXPENSE',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    };
  }
}
