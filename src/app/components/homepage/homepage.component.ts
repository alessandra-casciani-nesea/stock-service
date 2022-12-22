import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent {

  form: FormGroup;
  stocks: string[];

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      stockInput: ['', [Validators.required, Validators.pattern('[a-zA-Z]{1,5}')]]
    });

    this.stocks = this.stocksFromLocalStorage
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    // non c'è differenza fra maiuscole o minuscole nella chiamata al servizio,
    // ma per controlli successivi salvo già la sigla in upperCase
    const stock = this.form.get('stockInput')?.value.toUpperCase();

    //creo un Set di stock, in questo modo vengono eliminati subito i doppioni e la chiamata non viene neanche fatta
    this.stocks = Array.from(new Set<string>([...this.stocks, stock]));
    this.resetLocalStorage();

    this.form.reset();
  }

  removeStock(stockToDelete: string):void {
    this.stocks = this.stocks.filter(s => s !== stockToDelete);
    this.resetLocalStorage();
  }

  private resetLocalStorage(): void {
    localStorage.setItem('stocks', JSON.stringify(this.stocks));
  }

  private get stocksFromLocalStorage(): string[] {
    return JSON.parse(localStorage.getItem('stocks') || '[]');
  }
}
